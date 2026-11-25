import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/catalog";
import { slugify } from "@/lib/utils";

export async function GET(
  _req: Request,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;
  const identifier = decodeURIComponent(username || "").trim();

  if (!identifier) {
    return NextResponse.json({ error: "Profile identifier required" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    let student: Record<string, unknown> | null = null;

    if (isUuid(identifier)) {
      const { data } = await admin
        .from("profiles")
        .select("id, full_name, avatar_url, bio, location, website, github_url, linkedin_url, created_at")
        .eq("id", identifier)
        .eq("role", "student")
        .maybeSingle();
      student = data;
    } else {
      const { data: candidates } = await admin
        .from("profiles")
        .select("id, full_name, avatar_url, bio, location, website, github_url, linkedin_url, created_at")
        .eq("role", "student");

      student =
        (candidates || []).find(
          (c) =>
            slugify(c.full_name) === identifier.toLowerCase() ||
            c.id.toLowerCase().startsWith(identifier.toLowerCase())
        ) || null;
    }

    if (!student) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    const { data: authRecord } = await admin.auth.admin.getUserById(String(student.id));
    const isPublic =
      authRecord?.user?.user_metadata?.privacy_settings?.public_portfolio !== false;

    if (!isPublic) {
      return NextResponse.json(
        { error: "This learner's public portfolio is set to private." },
        { status: 403 }
      );
    }

    const [projectsRes, skillsRes, certsRes] = await Promise.all([
      admin
        .from("projects")
        .select("*")
        .eq("student_id", String(student.id))
        .eq("is_public", true)
        .eq("status", "published")
        .order("created_at", { ascending: false }),
      admin
        .from("user_skills")
        .select("proficiency, verified, skill:skills(name, category)")
        .eq("user_id", String(student.id)),
      admin
        .from("certificates")
        .select("id, certificate_number, issued_at, course:courses(title, category)")
        .eq("student_id", String(student.id)),
    ]);

    return NextResponse.json({
      profile: student,
      projects: projectsRes.data || [],
      skills: skillsRes.data || [],
      certificates: certsRes.data || [],
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load portfolio" },
      { status: 500 }
    );
  }
}
