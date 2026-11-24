import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES, ROLE_ROUTES } from "@/lib/constants";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/portfolio",
];

// Check if a path matches any public route
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );
}

// Check if a path is an API route
function isApiRoute(path: string): boolean {
  return path.startsWith("/api/");
}

// Check if a path is a static asset
function isStaticAsset(path: string): boolean {
  return (
    path.startsWith("/_next/") ||
    path.startsWith("/favicon") ||
    path.includes(".")
  );
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip auth checks for static assets and API routes
  if (isStaticAsset(path) || isApiRoute(path)) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is unconfigured or has placeholder values (e.g. offline dev / demo mode),
  // bypass SSR Supabase auth so the application runs seamlessly.
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseUrl.startsWith("http") ||
    supabaseUrl.includes("your_supabase_project_url")
  ) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
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
    }
  );

  // Fast-path: If user has no auth session cookie and is on a public route, skip remote check
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!hasAuthCookie && isPublicRoute(path)) {
    return supabaseResponse;
  }

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute(path)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  // If user is authenticated
  if (user) {
    // Redirect from auth pages to dashboard
    if (
      path === ROUTES.LOGIN ||
      path === ROUTES.REGISTER
    ) {
      // Fetch profile to determine role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = ROUTES.ONBOARDING;
        return NextResponse.redirect(url);
      }

      if (profile?.role) {
        const url = request.nextUrl.clone();
        url.pathname = ROLE_ROUTES[profile.role] || ROUTES.STUDENT_DASHBOARD;
        return NextResponse.redirect(url);
      }
    }

    // Role-based route protection
    if (path.startsWith("/student") || path.startsWith("/recruiter") || path.startsWith("/admin")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!profile) {
        const url = request.nextUrl.clone();
        url.pathname = ROUTES.ONBOARDING;
        return NextResponse.redirect(url);
      }

      if (!profile.onboarding_completed) {
        const url = request.nextUrl.clone();
        url.pathname = ROUTES.ONBOARDING;
        return NextResponse.redirect(url);
      }

      // Check role matches route
      const requiredRole = path.startsWith("/student")
        ? "student"
        : path.startsWith("/recruiter")
        ? "recruiter"
        : path.startsWith("/admin")
        ? "admin"
        : null;

      if (requiredRole && profile.role !== requiredRole && profile.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = ROLE_ROUTES[profile.role] || "/";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
