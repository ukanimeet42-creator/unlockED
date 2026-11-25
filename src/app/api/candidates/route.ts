import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/api-auth";

export async function GET(req: Request) {
  const auth = await requireApiRole(["recruiter", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { admin } = auth.ctx;

  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").toLowerCase().trim();
  const locationFilter = (searchParams.get("location") || "").toLowerCase().trim();

  try {
    const { data: students, error } = await admin
      .from("profiles")
      .select("id, full_name, avatar_url, bio, location, github_url, linkedin_url, created_at")
      .eq("role", "student")
      .eq("onboarding_completed", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const studentIds = (students || []).map((s) => s.id);
    if (studentIds.length === 0) {
      return NextResponse.json({ candidates: [] });
    }

    const [projectsRes, skillsRes, attemptsRes, certsRes] = await Promise.all([
      admin
        .from("projects")
        .select("id, student_id, title, technologies, github_url, live_url, is_public")
        .in("student_id", studentIds)
        .eq("is_public", true)
        .eq("status", "published"),
      admin
        .from("user_skills")
        .select("user_id, proficiency, verified, skill:skills(name)")
        .in("user_id", studentIds),
      admin
        .from("assessment_attempts")
        .select("student_id, percentage, passed")
        .in("student_id", studentIds),
      admin
        .from("certificates")
        .select("student_id, certificate_number")
        .in("student_id", studentIds),
    ]);

    const candidates = (students || [])
      .map((s) => {
        const sProjects = (projectsRes.data || []).filter((p) => p.student_id === s.id);
        const sSkills = (skillsRes.data || [])
          .filter((sk) => sk.user_id === s.id)
          .map((sk: Record<string, unknown>) => ({
            name: (sk.skill as { name?: string } | null)?.name || "",
            verified: Boolean(sk.verified),
            proficiency: String(sk.proficiency || "beginner"),
          }))
          .filter((x) => x.name);

        const sAttempts = (attemptsRes.data || []).filter((a) => a.student_id === s.id);
        const avgScore =
          sAttempts.length > 0
            ? Math.round(
                sAttempts.reduce((acc, item) => acc + Number(item.percentage), 0) / sAttempts.length
              )
            : null;
        const sCerts = (certsRes.data || []).filter((c) => c.student_id === s.id);

        return {
          id: s.id,
          full_name: s.full_name,
          avatar_url: s.avatar_url,
          bio: s.bio || "",
          location: s.location || "Remote",
          github_url: s.github_url,
          linkedin_url: s.linkedin_url,
          skills: sSkills,
          projects: sProjects,
          averageAssessmentScore: avgScore,
          passedBenchmarks: sAttempts.filter((a) => a.passed).length,
          certificatesCount: sCerts.length,
        };
      })
      .filter((c) => {
        const matchesLoc =
          !locationFilter || c.location.toLowerCase().includes(locationFilter);
        if (!matchesLoc) return false;
        if (!query) return true;
        return (
          c.full_name.toLowerCase().includes(query) ||
          c.bio.toLowerCase().includes(query) ||
          c.skills.some((sk) => sk.name.toLowerCase().includes(query)) ||
          c.projects.some(
            (p) =>
              p.title.toLowerCase().includes(query) ||
              (p.technologies || []).some((t: string) => t.toLowerCase().includes(query))
          )
        );
      });

    return NextResponse.json({ candidates });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load candidates" },
      { status: 500 }
    );
  }
}
