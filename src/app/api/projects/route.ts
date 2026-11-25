import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";

const ProjectCreateSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().min(10).max(5000),
  technologies: z.array(z.string().max(40)).max(20).optional().default([]),
  github_url: z.string().url().optional().or(z.literal("")).nullable(),
  live_url: z.string().url().optional().or(z.literal("")).nullable(),
  thumbnail_url: z.string().url().optional().or(z.literal("")).nullable(),
  is_public: z.boolean().optional().default(true),
  status: z.enum(["draft", "published", "archived"]).optional().default("published"),
});

export async function GET() {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data || [] });
}

export async function POST(req: Request) {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const parsed = ProjectCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid project fields" },
        { status: 400 }
      );
    }

    const { title, description, technologies, github_url, live_url, thumbnail_url, is_public, status } =
      parsed.data;

    const { data: project, error } = await admin
      .from("projects")
      .insert({
        student_id: user.id,
        title: title.trim(),
        description: description.trim(),
        short_description: description.trim().slice(0, 140),
        technologies,
        github_url: github_url || null,
        live_url: live_url || null,
        thumbnail_url: thumbnail_url || null,
        is_public,
        status,
      })
      .select("*")
      .single();

    if (error || !project) {
      return NextResponse.json({ error: error?.message || "Failed to create project" }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save project" },
      { status: 500 }
    );
  }
}
