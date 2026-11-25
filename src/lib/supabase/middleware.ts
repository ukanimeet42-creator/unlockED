import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, ROLE_ROUTES } from "@/lib/constants";

const publicRoutes = [
  "/",
  "/courses",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/portfolio",
  "/verify",
];

function isPublicRoute(path: string): boolean {
  return publicRoutes.some(
    (route) => path === route || (route !== "/" && path.startsWith(route + "/"))
  );
}

function isApiRoute(path: string): boolean {
  return path.startsWith("/api/");
}

function isStaticAsset(path: string): boolean {
  return (
    path.startsWith("/_next/") ||
    path.startsWith("/favicon") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/i.test(path)
  );
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (isStaticAsset(path) || isApiRoute(path)) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseUrl.startsWith("http") ||
    supabaseUrl.includes("your_supabase_project_url")
  ) {
    if (!isPublicRoute(path)) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.LOGIN;
      url.searchParams.set("error", "backend_unconfigured");
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-"));

  // Skip remote auth verification for anonymous requests hitting public pages
  if (!hasAuthCookie && isPublicRoute(path)) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all non-public routes (including /onboarding, /student*, /recruiter*, /admin*)
  if (!user && !isPublicRoute(path)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (user) {
    // Enforce account suspension check
    if (user.user_metadata?.account_status === "suspended") {
      await supabase.auth.signOut();
      if (path !== ROUTES.LOGIN) {
        const url = request.nextUrl.clone();
        url.pathname = ROUTES.LOGIN;
        url.searchParams.set("error", "suspended");
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    const needsRoleRouting =
      path === ROUTES.LOGIN ||
      path === ROUTES.REGISTER ||
      path === ROUTES.ONBOARDING ||
      path.startsWith("/student") ||
      path.startsWith("/recruiter") ||
      path.startsWith("/admin");

    if (needsRoleRouting) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", user.id)
        .single();

      // If auth pages visited while already signed in
      if (path === ROUTES.LOGIN || path === ROUTES.REGISTER) {
        const url = request.nextUrl.clone();
        if (!profile || !profile.onboarding_completed) {
          url.pathname = ROUTES.ONBOARDING;
        } else {
          url.pathname = ROLE_ROUTES[profile.role] || ROUTES.STUDENT_DASHBOARD;
        }
        return NextResponse.redirect(url);
      }

      // Already onboarded users visiting /onboarding go to their workspace
      if (path === ROUTES.ONBOARDING && profile?.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = ROLE_ROUTES[profile.role] || ROUTES.STUDENT_DASHBOARD;
        return NextResponse.redirect(url);
      }

      // Role-protected dashboards
      if (
        path.startsWith("/student") ||
        path.startsWith("/recruiter") ||
        path.startsWith("/admin")
      ) {
        if (!profile || !profile.onboarding_completed) {
          const url = request.nextUrl.clone();
          url.pathname = ROUTES.ONBOARDING;
          return NextResponse.redirect(url);
        }

        const requiredRole = path.startsWith("/student")
          ? "student"
          : path.startsWith("/recruiter")
          ? "recruiter"
          : "admin";

        if (profile.role !== requiredRole) {
          const url = request.nextUrl.clone();
          url.pathname = ROLE_ROUTES[profile.role] || ROUTES.HOME;
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
