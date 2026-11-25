import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AccountStatus, Notification, Profile, UserRole } from "@/types";

export interface AuthenticatedContext {
  user: User;
  profile: Profile;
  supabase: SupabaseClient;
  admin: SupabaseClient;
}

export function isUserSuspended(
  authUser: Pick<User, "user_metadata"> & { banned_until?: string | null },
  profile?: { status?: string | null } | null
): boolean {
  if (profile?.status === "suspended") return true;
  if (authUser.user_metadata?.account_status === "suspended") return true;
  const bannedUntil = authUser.banned_until;
  if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) {
    return true;
  }
  return false;
}

export function normalizeProfileRow(
  row: Record<string, unknown>,
  authUser?: Pick<User, "user_metadata"> & { banned_until?: string | null }
): Profile {
  const meta = (authUser?.user_metadata || {}) as Record<string, unknown>;
  const suspended = authUser
    ? isUserSuspended(authUser, { status: row.status as string | undefined })
    : row.status === "suspended";

  return {
    id: String(row.id),
    email: String(row.email),
    full_name: String(row.full_name || "Learner"),
    avatar_url: (row.avatar_url as string | null) ?? null,
    role: (row.role as UserRole) || "student",
    status: (suspended ? "suspended" : "active") as AccountStatus,
    suspended_at: (row.suspended_at as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    github_url: (row.github_url as string | null) ?? null,
    linkedin_url: (row.linkedin_url as string | null) ?? null,
    onboarding_completed: Boolean(row.onboarding_completed),
    notification_preferences:
      (row.notification_preferences as Profile["notification_preferences"]) ??
      (meta.notification_preferences as Profile["notification_preferences"]) ?? {
        email_updates: true,
        job_alerts: true,
        course_reminders: true,
      },
    privacy_settings:
      (row.privacy_settings as Profile["privacy_settings"]) ??
      (meta.privacy_settings as Profile["privacy_settings"]) ?? {
        public_portfolio: true,
        show_email_to_recruiters: false,
      },
    created_at: String(row.created_at || new Date().toISOString()),
    updated_at: String(row.updated_at || new Date().toISOString()),
  };
}

/**
 * Resolves and validates the authenticated caller from Supabase SSR cookies.
 * Auto-provisions missing profile rows safely without ever granting admin.
 */
export async function getAuthenticatedContext(): Promise<
  | { ctx: AuthenticatedContext; errorResponse?: never }
  | { ctx?: never; errorResponse: NextResponse }
> {
  if (!isSupabaseConfigured()) {
    return {
      errorResponse: NextResponse.json(
        { error: "Supabase backend is not configured." },
        { status: 503 }
      ),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 }
      ),
    };
  }

  const admin = createAdminClient();
  const { data: authRecord } = await admin.auth.admin.getUserById(user.id);
  const fullAuthUser = authRecord?.user || user;

  let { data: profileRow } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profileRow) {
    const requestedRole =
      fullAuthUser.user_metadata?.requested_role === "recruiter"
        ? "recruiter"
        : "student";
    const derivedName =
      typeof fullAuthUser.user_metadata?.full_name === "string" &&
      fullAuthUser.user_metadata.full_name.trim().length > 0
        ? fullAuthUser.user_metadata.full_name.trim()
        : (user.email || "user").split("@")[0];

    const { data: inserted, error: insertErr } = await admin
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || "",
        full_name: derivedName,
        role: requestedRole,
        onboarding_completed: false,
      })
      .select("*")
      .single();

    if (insertErr || !inserted) {
      return {
        errorResponse: NextResponse.json(
          { error: "Failed to initialize user profile." },
          { status: 500 }
        ),
      };
    }
    profileRow = inserted;
  }

  if (isUserSuspended(fullAuthUser, profileRow)) {
    return {
      errorResponse: NextResponse.json(
        { error: "Account has been suspended by an administrator." },
        { status: 403 }
      ),
    };
  }

  return {
    ctx: {
      user: fullAuthUser,
      profile: normalizeProfileRow(profileRow, fullAuthUser),
      supabase,
      admin,
    },
  };
}

export async function requireApiRole(allowedRoles: UserRole[]): Promise<
  | { ctx: AuthenticatedContext; errorResponse?: never }
  | { ctx?: never; errorResponse: NextResponse }
> {
  const result = await getAuthenticatedContext();
  if (result.errorResponse) return result;

  if (!allowedRoles.includes(result.ctx.profile.role)) {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden: You do not have permission for this resource." },
        { status: 403 }
      ),
    };
  }

  return result;
}

export async function createNotification(
  admin: SupabaseClient,
  params: {
    userId: string;
    type: Notification["type"];
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await admin.from("notifications").insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || {},
      read: false,
    });
  } catch (err) {
    console.warn("Failed to insert notification:", err);
  }
}

export async function recordAuditLog(
  admin: SupabaseClient,
  params: {
    actorId: string | null;
    action: string;
    targetType: string;
    targetId?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const { error } = await admin.from("audit_logs").insert({
      actor_id: params.actorId,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId || null,
      metadata: params.metadata || {},
    });
    if (error) {
      // Fallback: keep trace via admin notifications if audit_logs migration wasn't applied yet
      const { data: admins } = await admin
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(3);
      if (admins && admins.length > 0) {
        await admin.from("notifications").insert({
          user_id: admins[0].id,
          type: "system",
          title: `Audit: ${params.action}`,
          message: `${params.targetType} ${params.targetId || ""}`.trim(),
          data: { audit: true, ...params.metadata },
          read: false,
        });
      }
    }
  } catch {
    // Non-fatal telemetry logging
  }
}
