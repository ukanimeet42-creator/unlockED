import { NextResponse } from "next/server";
import { z } from "zod";
import { createNotification, getAuthenticatedContext, requireApiRole } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

const ApplySchema = z.object({
  jobId: z.string().min(1),
  resumeId: z.string().nullable().optional(),
  coverLetter: z.string().min(10, "Please include a brief note to the hiring team").max(4000),
});

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  try {
    if (profile.role === "student") {
      const { data, error } = await admin
        .from("applications")
        .select("*, job:jobs(*, company:companies(*))")
        .eq("student_id", user.id)
        .order("applied_at", { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ applications: data || [] });
    }

    if (profile.role === "recruiter") {
      const { data: recruiterJobs } = await admin
        .from("jobs")
        .select("id")
        .eq("recruiter_id", user.id);

      const jobIds = (recruiterJobs || []).map((j) => j.id);
      if (jobIds.length === 0) {
        return NextResponse.json({ applications: [] });
      }

      const { data: apps, error } = await admin
        .from("applications")
        .select(
          "*, job:jobs(id, title, location, job_type), student:profiles(id, full_name, avatar_url, bio, location, github_url, linkedin_url)"
        )
        .in("job_id", jobIds)
        .order("applied_at", { ascending: false });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const studentIds = Array.from(new Set((apps || []).map((a) => a.student_id)));
      const [attemptsRes, projectsRes, skillsRes, notesRes] =
        studentIds.length > 0
          ? await Promise.all([
              admin
                .from("assessment_attempts")
                .select("student_id, percentage, passed")
                .in("student_id", studentIds),
              admin
                .from("projects")
                .select("id, student_id, title, is_public")
                .in("student_id", studentIds)
                .eq("is_public", true),
              admin
                .from("user_skills")
                .select("user_id, verified, skill:skills(name)")
                .in("user_id", studentIds),
              admin
                .from("notifications")
                .select("data, created_at")
                .eq("user_id", user.id)
                .eq("type", "system")
                .order("created_at", { ascending: false })
                .limit(200),
            ])
          : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

      const noteByApp = new Map<string, { interviewAt?: string | null; recruiterNote?: string | null }>();
      for (const n of notesRes.data || []) {
        const d = (n.data || {}) as Record<string, unknown>;
        if (d.kind === "recruiter_application_note" && typeof d.applicationId === "string" && !noteByApp.has(d.applicationId)) {
          noteByApp.set(d.applicationId, {
            interviewAt: (d.interviewAt as string | null) || null,
            recruiterNote: (d.recruiterNote as string | null) || null,
          });
        }
      }

      const hydrated = (apps || []).map((app) => {
        const sAttempts = (attemptsRes.data || []).filter((x) => x.student_id === app.student_id);
        const avgScore =
          sAttempts.length > 0
            ? Math.round(
                sAttempts.reduce((acc, a) => acc + Number(a.percentage), 0) / sAttempts.length
              )
            : null;
        const sProjects = (projectsRes.data || []).filter((p) => p.student_id === app.student_id);
        const sSkills = (skillsRes.data || [])
          .filter((s) => s.user_id === app.student_id)
          .map((s: Record<string, unknown>) => (s.skill as { name?: string } | null)?.name)
          .filter(Boolean);
        const noteMeta = noteByApp.get(app.id);

        return {
          ...app,
          interviewAt: noteMeta?.interviewAt || null,
          recruiterNote: noteMeta?.recruiterNote || null,
          candidateMetrics: {
            averageAssessmentScore: avgScore,
            assessmentsCompleted: sAttempts.length,
            publicProjectsCount: sProjects.length,
            skills: sSkills,
          },
        };
      });

      return NextResponse.json({ applications: hydrated });
    }

    // Admin
    const { data: allApps, error } = await admin
      .from("applications")
      .select("*, job:jobs(id, title), student:profiles(id, full_name, email)")
      .order("applied_at", { ascending: false })
      .limit(100);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ applications: allApps || [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  try {
    const parsed = ApplySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid application fields" },
        { status: 400 }
      );
    }

    const { jobId, resumeId, coverLetter } = parsed.data;
    if (!isUuid(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const { data: job } = await admin
      .from("jobs")
      .select("id, title, recruiter_id, is_active")
      .eq("id", jobId)
      .single();

    if (!job || !job.is_active) {
      return NextResponse.json({ error: "Job is no longer accepting applications" }, { status: 404 });
    }

    const { data: existing } = await admin
      .from("applications")
      .select("id")
      .eq("student_id", user.id)
      .eq("job_id", jobId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted an application for this position." },
        { status: 409 }
      );
    }

    let validResumeId: string | null = null;
    if (resumeId && isUuid(resumeId)) {
      const { data: ownResume } = await admin
        .from("resumes")
        .select("id")
        .eq("id", resumeId)
        .eq("student_id", user.id)
        .maybeSingle();
      if (ownResume) validResumeId = ownResume.id;
    } else {
      const { data: primaryRes } = await admin
        .from("resumes")
        .select("id")
        .eq("student_id", user.id)
        .eq("is_primary", true)
        .maybeSingle();
      validResumeId = primaryRes?.id || null;
    }

    const { data: application, error } = await admin
      .from("applications")
      .insert({
        student_id: user.id,
        job_id: jobId,
        resume_id: validResumeId,
        cover_letter: coverLetter.trim(),
        status: "pending",
      })
      .select("*, job:jobs(*, company:companies(*))")
      .single();

    if (error || !application) {
      return NextResponse.json({ error: error?.message || "Failed to submit application" }, { status: 500 });
    }

    // Notify recruiter in real time
    await createNotification(admin, {
      userId: job.recruiter_id,
      type: "application_update",
      title: "New Candidate Application",
      message: `${profile.full_name} applied for "${job.title}".`,
      data: { applicationId: application.id, jobId: job.id, studentId: user.id },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit application" },
      { status: 500 }
    );
  }
}
