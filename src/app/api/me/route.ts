import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/api-auth";
import { COURSE_UUID_TO_SLUG, LESSON_UUID_TO_SLUG } from "@/lib/catalog";

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;

  const { user, profile, admin } = auth.ctx;

  try {
    const [
      enrollRes,
      progressRes,
      savedRes,
      appsRes,
      attemptsRes,
      resumesRes,
      projectsRes,
      certsRes,
      notifRes,
      skillsRes,
      roadmapsRes,
      companyRes,
    ] = await Promise.all([
      admin.from("enrollments").select("*").eq("student_id", user.id),
      admin.from("lesson_progress").select("*").eq("student_id", user.id).eq("completed", true),
      admin.from("saved_jobs").select("job_id").eq("student_id", user.id),
      admin
        .from("applications")
        .select("*, job:jobs(*, company:companies(*))")
        .eq("student_id", user.id)
        .order("applied_at", { ascending: false }),
      admin
        .from("assessment_attempts")
        .select("*")
        .eq("student_id", user.id)
        .order("completed_at", { ascending: false }),
      admin
        .from("resumes")
        .select("*")
        .eq("student_id", user.id)
        .order("updated_at", { ascending: false }),
      admin
        .from("projects")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false }),
      admin
        .from("certificates")
        .select("*, course:courses(id, title, category)")
        .eq("student_id", user.id)
        .order("issued_at", { ascending: false }),
      admin
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(40),
      admin
        .from("user_skills")
        .select("*, skill:skills(*)")
        .eq("user_id", user.id),
      admin
        .from("career_roadmaps")
        .select("*")
        .eq("student_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5),
      profile.role === "recruiter"
        ? admin.from("companies").select("*").eq("recruiter_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const enrolledCourseIds: string[] = [];
    for (const row of enrollRes.data || []) {
      enrolledCourseIds.push(row.course_id);
      if (COURSE_UUID_TO_SLUG[row.course_id]) {
        enrolledCourseIds.push(COURSE_UUID_TO_SLUG[row.course_id]);
      }
    }

    const completedLessons: string[] = [];
    for (const row of progressRes.data || []) {
      completedLessons.push(row.lesson_id);
      if (LESSON_UUID_TO_SLUG[row.lesson_id]) {
        completedLessons.push(LESSON_UUID_TO_SLUG[row.lesson_id]);
      }
    }

    return NextResponse.json({
      profile,
      interests: Array.isArray(user.user_metadata?.interests)
        ? user.user_metadata.interests
        : [],
      enrollments: enrollRes.data || [],
      enrolledCourseIds: Array.from(new Set(enrolledCourseIds)),
      completedLessons: Array.from(new Set(completedLessons)),
      lessonProgress: progressRes.data || [],
      savedJobIds: (savedRes.data || []).map((r) => r.job_id),
      applications: appsRes.data || [],
      assessmentAttempts: attemptsRes.data || [],
      resumes: resumesRes.data || [],
      projects: projectsRes.data || [],
      certificates: certsRes.data || [],
      notifications: notifRes.data || [],
      userSkills: skillsRes.data || [],
      roadmaps: roadmapsRes.data || [],
      company: companyRes.data || null,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load user workspace" },
      { status: 500 }
    );
  }
}
