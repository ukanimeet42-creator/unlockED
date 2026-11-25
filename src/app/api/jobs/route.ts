import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedContext, requireApiRole } from "@/lib/api-auth";
import { computeDeterministicJobMatch } from "@/lib/ai/job-matching";
import type { Job, Project } from "@/types";

const CreateJobSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(20).max(6000),
  requirements: z.array(z.string().max(240)).optional().default([]),
  responsibilities: z.array(z.string().max(240)).optional().default([]),
  skills_required: z.array(z.string().max(60)).min(1, "Add at least one required skill"),
  location: z.string().min(2).max(140),
  job_type: z.enum(["full-time", "part-time", "contract", "internship"]),
  experience_level: z.enum(["entry", "mid", "senior"]).optional().default("entry"),
  salary_min: z.number().int().min(0).nullable().optional(),
  salary_max: z.number().int().min(0).nullable().optional(),
  salary_currency: z.enum(["USD", "INR"]).optional().default("INR"),
  is_remote: z.boolean().optional().default(false),
  application_deadline: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  const { searchParams } = new URL(req.url);
  const mineOnly = searchParams.get("mine") === "true";

  try {
    let query = admin
      .from("jobs")
      .select("*, company:companies(*)")
      .order("created_at", { ascending: false });

    if (profile.role === "recruiter" && mineOnly) {
      query = query.eq("recruiter_id", user.id);
    } else if (profile.role !== "admin") {
      query = query.eq("is_active", true);
    }

    const { data: jobs, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const jobIds = (jobs || []).map((j) => j.id);
    const appCounts = new Map<string, number>();
    if (jobIds.length > 0 && (profile.role === "recruiter" || profile.role === "admin")) {
      const { data: apps } = await admin
        .from("applications")
        .select("job_id")
        .in("job_id", jobIds);
      for (const a of apps || []) {
        appCounts.set(a.job_id, (appCounts.get(a.job_id) || 0) + 1);
      }
    }

    // For students, compute honest, explainable deterministic skill-overlap score
    let studentSkills: string[] = [];
    let studentProjects: Pick<Project, "title" | "technologies">[] = [];
    if (profile.role === "student") {
      const [sRes, pRes] = await Promise.all([
        admin.from("user_skills").select("skill:skills(name)").eq("user_id", user.id),
        admin.from("projects").select("title, technologies").eq("student_id", user.id),
      ]);
      studentSkills = (sRes.data || [])
        .map((r: Record<string, unknown>) => (r.skill as { name?: string } | null)?.name)
        .filter((x): x is string => Boolean(x));
      studentProjects = (pRes.data || []) as Pick<Project, "title" | "technologies">[];
    }

    const enriched = (jobs || []).map((j) => {
      const jobObj = j as Job;
      const match =
        profile.role === "student"
          ? computeDeterministicJobMatch({
              candidateSkills: studentSkills,
              candidateProjects: studentProjects,
              job: jobObj,
            })
          : null;

      return {
        ...jobObj,
        application_count: appCounts.get(jobObj.id) || 0,
        match,
      };
    });

    return NextResponse.json({ jobs: enriched });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireApiRole(["recruiter"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  try {
    const parsed = CreateJobSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid job posting fields" },
        { status: 400 }
      );
    }

    if (
      parsed.data.salary_min != null &&
      parsed.data.salary_max != null &&
      parsed.data.salary_max < parsed.data.salary_min
    ) {
      return NextResponse.json(
        { error: "Maximum salary must be greater than or equal to minimum salary" },
        { status: 400 }
      );
    }

    // Ensure recruiter has a company record
    let { data: company } = await admin
      .from("companies")
      .select("*")
      .eq("recruiter_id", user.id)
      .maybeSingle();

    if (!company) {
      const { data: createdCompany, error: compErr } = await admin
        .from("companies")
        .insert({
          recruiter_id: user.id,
          name: `${profile.full_name}'s Hiring Team`,
          location: profile.location || "Remote",
          industry: "Technology",
          verified: false,
        })
        .select("*")
        .single();

      if (compErr || !createdCompany) {
        return NextResponse.json(
          { error: "Please set up your Company Profile before posting a job." },
          { status: 400 }
        );
      }
      company = createdCompany;
    }

    const { data: job, error } = await admin
      .from("jobs")
      .insert({
        company_id: company.id,
        recruiter_id: user.id,
        title: parsed.data.title.trim(),
        description: parsed.data.description.trim(),
        requirements: parsed.data.requirements,
        responsibilities: parsed.data.responsibilities,
        skills_required: parsed.data.skills_required,
        location: parsed.data.location.trim(),
        job_type: parsed.data.job_type,
        experience_level: parsed.data.experience_level,
        salary_min: parsed.data.salary_min ?? null,
        salary_max: parsed.data.salary_max ?? null,
        salary_currency: parsed.data.salary_currency,
        is_remote: parsed.data.is_remote,
        is_active: true,
        application_deadline: parsed.data.application_deadline || null,
      })
      .select("*, company:companies(*)")
      .single();

    if (error || !job) {
      return NextResponse.json({ error: error?.message || "Failed to publish job" }, { status: 500 });
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to publish job" },
      { status: 500 }
    );
  }
}
