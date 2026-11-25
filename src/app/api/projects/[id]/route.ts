import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

const ProjectUpdateSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  description: z.string().min(10).max(5000).optional(),
  technologies: z.array(z.string().max(40)).max(20).optional(),
  github_url: z.string().url().optional().or(z.literal("")).nullable(),
  live_url: z.string().url().optional().or(z.literal("")).nullable(),
  thumbnail_url: z.string().url().optional().or(z.literal("")).nullable(),
  is_public: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  try {
    const parsed = ProjectUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update payload" },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = { ...parsed.data };
    if (patch.github_url === "") patch.github_url = null;
    if (patch.live_url === "") patch.live_url = null;
    if (patch.thumbnail_url === "") patch.thumbnail_url = null;
    if (typeof patch.description === "string") {
      patch.short_description = patch.description.slice(0, 140);
    }

    const { data: updated, error } = await admin
      .from("projects")
      .update(patch)
      .eq("id", id)
      .eq("student_id", user.id)
      .select("*")
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: "Project not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json({ project: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  const { error } = await admin
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("student_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
