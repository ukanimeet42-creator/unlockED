import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLE_ROUTES, ROUTES } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", data.user.id)
        .single();

      if (next && next.startsWith("/")) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (!profile || !profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}${ROUTES.ONBOARDING}`);
      }

      const target = ROLE_ROUTES[profile.role] || ROUTES.STUDENT_DASHBOARD;
      return NextResponse.redirect(`${origin}${target}`);
    }
  }

  return NextResponse.redirect(`${origin}${ROUTES.LOGIN}?error=auth_callback_failed`);
}
