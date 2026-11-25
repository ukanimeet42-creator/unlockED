import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await requireApiRole(["admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { admin } = auth.ctx;

  const { searchParams } = new URL(req.url);
  const days = Math.min(365, Math.max(7, Number(searchParams.get("days")) || 30));
  const cutoffIso = new Date(Date.now() - days * 86400 * 1000).toISOString();

  try {
    const [
      profilesRes,
      companiesRes,
      coursesRes,
      enrollRes,
      attemptsRes,
      jobsRes,
      appsRes,
      projectsRes,
      certsRes,
      auditRes,
    ] = await Promise.all([
      admin.from("profiles").select("id, role, created_at").order("created_at", { ascending: true }),
      admin.from("companies").select("id, name, verified, created_at"),
      admin.from("courses").select("id, title, category, is_published"),
      admin.from("enrollments").select("id, course_id, status, enrolled_at"),
      admin.from("assessment_attempts").select("id, percentage, passed, completed_at"),
      admin.from("jobs").select("id, is_active, created_at"),
      admin.from("applications").select("id, status, applied_at"),
      admin.from("projects").select("id, status, is_public, created_at"),
      admin.from("certificates").select("id, issued_at"),
      admin.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(25),
    ]);

    const profiles = profilesRes.data || [];
    const companies = companiesRes.data || [];
    const courses = coursesRes.data || [];
    const enrollments = enrollRes.data || [];
    const attempts = attemptsRes.data || [];
    const jobs = jobsRes.data || [];
    const applications = appsRes.data || [];
    const projects = projectsRes.data || [];
    const certificates = certsRes.data || [];

    // Aggregate time series within selected date window
    const dateBuckets = new Map<string, { date: string; users: number; enrollments: number; applications: number }>();
    const addPoint = (iso: string | null | undefined, field: "users" | "enrollments" | "applications") => {
      if (!iso || iso < cutoffIso) return;
      const dayKey = iso.slice(0, 10);
      const entry = dateBuckets.get(dayKey) || { date: dayKey, users: 0, enrollments: 0, applications: 0 };
      entry[field] += 1;
      dateBuckets.set(dayKey, entry);
    };

    profiles.forEach((p) => addPoint(p.created_at, "users"));
    enrollments.forEach((e) => addPoint(e.enrolled_at, "enrollments"));
    applications.forEach((a) => addPoint(a.applied_at, "applications"));

    const activityTimeline = Array.from(dateBuckets.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const categoryMap = new Map<string, number>();
    for (const c of courses) {
      const enrolledForCourse = enrollments.filter((e) => e.course_id === c.id).length;
      categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + enrolledForCourse);
    }

    const palette = ["#10B981", "#00DC82", "#06B6D4", "#F59E0B", "#34D399"];
    const domainDistribution = Array.from(categoryMap.entries())
      .filter(([, count]) => count > 0)
      .map(([name, value], idx) => ({
        name,
        value,
        color: palette[idx % palette.length],
      }));

    // Fallback system audit notes from recent notifications if audit_logs migration isn't applied yet
    let auditLogs = auditRes.data || [];
    if (auditRes.error) {
      const { data: sysNotifs } = await admin
        .from("notifications")
        .select("*")
        .eq("type", "system")
        .order("created_at", { ascending: false })
        .limit(20);
      auditLogs = (sysNotifs || []).map((n) => ({
        id: n.id,
        actor_id: n.user_id,
        action: n.title,
        target_type: "system",
        target_id: null,
        metadata: n.data,
        created_at: n.created_at,
      }));
    }

    const avgAssessmentScore =
      attempts.length > 0
        ? Math.round(attempts.reduce((s, a) => s + Number(a.percentage), 0) / attempts.length)
        : 0;

    return NextResponse.json({
      kpis: {
        totalUsers: profiles.length,
        studentsCount: profiles.filter((p) => p.role === "student").length,
        recruitersCount: profiles.filter((p) => p.role === "recruiter").length,
        adminsCount: profiles.filter((p) => p.role === "admin").length,
        verifiedPartners: companies.filter((c) => c.verified).length,
        pendingPartners: companies.filter((c) => !c.verified).length,
        publishedCourses: courses.filter((c) => c.is_published).length,
        totalEnrollments: enrollments.length,
        benchmarksTaken: attempts.length,
        benchmarkPassRate:
          attempts.length > 0
            ? Math.round((attempts.filter((a) => a.passed).length / attempts.length) * 100)
            : 0,
        avgAssessmentScore,
        activeJobs: jobs.filter((j) => j.is_active).length,
        totalApplications: applications.length,
        offersExtended: applications.filter((a) => a.status === "offered").length,
        publishedProjects: projects.filter((p) => p.status === "published").length,
        certificatesIssued: certificates.length,
      },
      activityTimeline,
      domainDistribution,
      auditLogs,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to compute admin overview" },
      { status: 500 }
    );
  }
}
