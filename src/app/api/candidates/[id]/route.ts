import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiRole(["recruiter", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const { data: student, error } = await admin
    .from("profiles")
    .select("id, full_name, email, avatar_url, bio, location, website, github_url, linkedin_url, created_at")
    .eq("id", id)
    .eq("role", "student")
    .single();

  if (error || !student) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const { data: authRecord } = await admin.auth.admin.getUserById(id);
  const showEmail = Boolean(authRecord?.user?.user_metadata?.privacy_settings?.show_email_to_recruiters);

  const [projectsRes, skillsRes, attemptsRes, certsRes] = await Promise.all([
    admin
      .from("projects")
      .select("*")
      .eq("student_id", id)
      .eq("is_public", true)
      .order("created_at", { ascending: false }),
    admin.from("user_skills").select("*, skill:skills(*)").eq("user_id", id),
    admin
      .from("assessment_attempts")
      .select("id, assessment_id, score, total_points, percentage, passed, completed_at")
      .eq("student_id", id)
      .order("completed_at", { ascending: false }),
    admin
      .from("certificates")
      .select("id, certificate_number, issued_at, course:courses(title, category)")
      .eq("student_id", id),
  ]);

  // Only reveal applicant resume if the candidate actually applied to this recruiter's job (or admin)
  let sharedResume = null;
  if (profile.role === "recruiter") {
    const { data: recruiterJobs } = await admin
      .from("jobs")
      .select("id")
      .eq("recruiter_id", user.id);
    const jobIds = (recruiterJobs || []).map((j) => j.id);
    if (jobIds.length > 0) {
      const { data: app } = await admin
        .from("applications")
        .select("resume_id")
        .eq("student_id", id)
        .in("job_id", jobIds)
        .not("resume_id", "is", null)
        .limit(1)
        .maybeSingle();

      if (app?.resume_id) {
        const { data: resRow } = await admin
          .from("resumes")
          .select("id, title, template, data")
          .eq("id", app.resume_id)
          .maybeSingle();
        sharedResume = resRow || null;
      }
    }
  }

  return NextResponse.json({
    candidate: {
      ...student,
      email: showEmail || profile.role === "admin" ? student.email : null,
      projects: projectsRes.data || [],
      skills: skillsRes.data || [],
      attempts: attemptsRes.data || [],
      certificates: certsRes.data || [],
      resume: sharedResume,
    },
  });
}
