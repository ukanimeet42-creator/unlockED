import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

const ResumeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(120).optional().default("Primary Resume"),
  template: z.enum(["modern-obsidian", "clean-light", "executive"]).default("modern-obsidian"),
  data: z.object({
    personal: z.object({
      name: z.string().max(120),
      email: z.string().max(160),
      phone: z.string().max(50).optional().default(""),
      location: z.string().max(120).optional().default(""),
      website: z.string().max(255).optional().default(""),
      linkedin: z.string().max(255).optional().default(""),
      github: z.string().max(255).optional().default(""),
      summary: z.string().max(2500).optional().default(""),
    }),
    experience: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    education: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    skills: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    projects: z.array(z.record(z.string(), z.unknown())).optional().default([]),
    certifications: z.array(z.record(z.string(), z.unknown())).optional().default([]),
  }),
});

export async function GET() {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { data, error } = await admin
    .from("resumes")
    .select("*")
    .eq("student_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ resumes: data || [] });
}

export async function PUT(req: Request) {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const parsed = ResumeSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid resume payload" },
        { status: 400 }
      );
    }

    const { id, title, template, data } = parsed.data;

    if (id && isUuid(id)) {
      const { data: updated, error } = await admin
        .from("resumes")
        .update({ title, template, data, is_primary: true })
        .eq("id", id)
        .eq("student_id", user.id)
        .select("*")
        .single();

      if (!error && updated) {
        return NextResponse.json({ resume: updated });
      }
    }

    // Look for existing primary resume or insert new
    const { data: existingPrimary } = await admin
      .from("resumes")
      .select("id")
      .eq("student_id", user.id)
      .eq("is_primary", true)
      .maybeSingle();

    if (existingPrimary) {
      const { data: updated, error } = await admin
        .from("resumes")
        .update({ title, template, data })
        .eq("id", existingPrimary.id)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ resume: updated });
    }

    const { data: inserted, error } = await admin
      .from("resumes")
      .insert({
        student_id: user.id,
        title,
        template,
        data,
        is_primary: true,
      })
      .select("*")
      .single();

    if (error || !inserted) {
      return NextResponse.json({ error: error?.message || "Failed to save resume" }, { status: 500 });
    }

    return NextResponse.json({ resume: inserted });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to persist resume" },
      { status: 500 }
    );
  }
}
