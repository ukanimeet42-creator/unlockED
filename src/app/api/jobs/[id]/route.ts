import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedContext } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

const PatchJobSchema = z.object({
  title: z.string().min(3).max(160).optional(),
  description: z.string().min(20).max(6000).optional(),
  requirements: z.array(z.string().max(240)).optional(),
  responsibilities: z.array(z.string().max(240)).optional(),
  skills_required: z.array(z.string().max(60)).min(1).optional(),
  location: z.string().min(2).max(140).optional(),
  job_type: z.enum(["full-time", "part-time", "contract", "internship"]).optional(),
  experience_level: z.enum(["entry", "mid", "senior"]).optional(),
  salary_min: z.number().int().min(0).nullable().optional(),
  salary_max: z.number().int().min(0).nullable().optional(),
  salary_currency: z.enum(["USD", "INR"]).optional(),
  is_remote: z.boolean().optional(),
  is_active: z.boolean().optional(),
  application_deadline: z.string().nullable().optional(),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { data: job, error } = await admin
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("id", id)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Only owner recruiter or admin can inspect applications for this job
  let applications: unknown[] = [];
  if (
    (profile.role === "recruiter" && job.recruiter_id === user.id) ||
    profile.role === "admin"
  ) {
    const { data: apps } = await admin
      .from("applications")
      .select("*, student:profiles(id, full_name, email, avatar_url, bio, location, github_url, linkedin_url)")
      .eq("job_id", id)
      .order("applied_at", { ascending: false });
    applications = apps || [];
  } else if (!job.is_active) {
    return NextResponse.json({ error: "Job is no longer active" }, { status: 404 });
  }

  return NextResponse.json({ job, applications });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  if (profile.role !== "recruiter" && profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  try {
    const parsed = PatchJobSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid job update" },
        { status: 400 }
      );
    }

    let query = admin.from("jobs").update(parsed.data).eq("id", id);
    if (profile.role !== "admin") {
      query = query.eq("recruiter_id", user.id);
    }

    const { data: updated, error } = await query.select("*, company:companies(*)").single();
    if (error || !updated) {
      return NextResponse.json({ error: "Job not found or forbidden" }, { status: 404 });
    }

    return NextResponse.json({ job: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  if (profile.role !== "recruiter" && profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  let query = admin.from("jobs").delete().eq("id", id);
  if (profile.role !== "admin") {
    query = query.eq("recruiter_id", user.id);
  }

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
