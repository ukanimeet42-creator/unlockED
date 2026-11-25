import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAuditLog, requireApiRole } from "@/lib/api-auth";
import { hydrateCourse, isUuid } from "@/lib/catalog";

const PatchCourseSchema = z.object({
  courseId: z.string().min(1),
  is_published: z.boolean(),
});

const CreateCourseSchema = z.object({
  title: z.string().min(4).max(160),
  description: z.string().min(20).max(3000),
  short_description: z.string().max(240).optional(),
  category: z.string().min(2).max(80),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  duration_weeks: z.number().int().min(1).max(52).default(6),
  tags: z.array(z.string().max(40)).optional().default([]),
});

export async function GET() {
  const auth = await requireApiRole(["admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { admin } = auth.ctx;

  const [{ data: courses, error }, { data: enrollments }, { data: lessons }] = await Promise.all([
    admin.from("courses").select("*").order("created_at", { ascending: true }),
    admin.from("enrollments").select("course_id"),
    admin.from("lessons").select("course_id"),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = (courses || []).map((c) => {
    const lCount = (lessons || []).filter((l) => l.course_id === c.id).length;
    const eCount = (enrollments || []).filter((e) => e.course_id === c.id).length;
    const hydrated = hydrateCourse(c, lCount);
    hydrated.enrolled_count = eCount;
    return hydrated;
  });

  return NextResponse.json({ courses: enriched });
}

export async function POST(req: Request) {
  const auth = await requireApiRole(["admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const parsed = CreateCourseSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid course payload" },
        { status: 400 }
      );
    }

    const { data: created, error } = await admin
      .from("courses")
      .insert({
        ...parsed.data,
        short_description: parsed.data.short_description || parsed.data.description.slice(0, 140),
        is_published: true,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error || !created) {
      return NextResponse.json({ error: error?.message || "Failed to create course" }, { status: 500 });
    }

    await recordAuditLog(admin, {
      actorId: user.id,
      action: "COURSE_CREATED",
      targetType: "course",
      targetId: created.id,
      metadata: { title: created.title },
    });

    return NextResponse.json({ course: hydrateCourse(created, 0) }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create course" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const auth = await requireApiRole(["admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const parsed = PatchCourseSchema.safeParse(await req.json());
  if (!parsed.success || !isUuid(parsed.data.courseId)) {
    return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
  }

  const { data: updated, error } = await admin
    .from("courses")
    .update({ is_published: parsed.data.is_published })
    .eq("id", parsed.data.courseId)
    .select("*")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  await recordAuditLog(admin, {
    actorId: user.id,
    action: parsed.data.is_published ? "COURSE_PUBLISHED" : "COURSE_UNPUBLISHED",
    targetType: "course",
    targetId: updated.id,
  });

  return NextResponse.json({ course: updated });
}
