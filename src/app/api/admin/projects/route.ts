import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAuditLog, requireApiRole } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

const PatchProjectModSchema = z.object({
  projectId: z.string().min(1),
  status: z.enum(["draft", "published", "archived"]).optional(),
  is_featured: z.boolean().optional(),
  is_public: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireApiRole(["admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { admin } = auth.ctx;

  const { data, error } = await admin
    .from("projects")
    .select("*, student:profiles(id, full_name, email)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data || [] });
}

export async function PATCH(req: Request) {
  const auth = await requireApiRole(["admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const parsed = PatchProjectModSchema.safeParse(await req.json());
  if (!parsed.success || !isUuid(parsed.data.projectId)) {
    return NextResponse.json({ error: "Invalid project moderation request" }, { status: 400 });
  }

  const { projectId, ...patch } = parsed.data;
  const { data: updated, error } = await admin
    .from("projects")
    .update(patch)
    .eq("id", projectId)
    .select("*")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await recordAuditLog(admin, {
    actorId: user.id,
    action: "PROJECT_MODERATED",
    targetType: "project",
    targetId: projectId,
    metadata: patch,
  });

  return NextResponse.json({ project: updated });
}
