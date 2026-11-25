import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const cleanCode = decodeURIComponent(code || "").trim().toUpperCase();

  if (!cleanCode) {
    return NextResponse.json({ error: "Credential code required" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("certificates")
      .select(
        "id, certificate_number, issued_at, student:profiles(full_name, location), course:courses(id, title, category, difficulty, duration_weeks)"
      )
      .eq("certificate_number", cleanCode)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ verified: false, error: "Credential not found" }, { status: 404 });
    }

    return NextResponse.json({
      verified: true,
      certificate: {
        certificate_number: data.certificate_number,
        issued_at: data.issued_at,
        status: "valid",
        recipient: data.student,
        course: data.course,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verification lookup failed" },
      { status: 500 }
    );
  }
}
