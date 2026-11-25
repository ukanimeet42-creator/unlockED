import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedContext, normalizeProfileRow } from "@/lib/api-auth";

const UpdateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(1500).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  website: z.string().max(255).nullable().optional(),
  github_url: z.string().max(255).nullable().optional(),
  linkedin_url: z.string().max(255).nullable().optional(),
  notification_preferences: z
    .object({
      email_updates: z.boolean(),
      job_alerts: z.boolean(),
      course_reminders: z.boolean(),
    })
    .optional(),
  privacy_settings: z
    .object({
      public_portfolio: z.boolean(),
      show_email_to_recruiters: z.boolean(),
    })
    .optional(),
});

export async function PATCH(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;

  const { user, admin } = auth.ctx;

  try {
    const raw = await req.json();
    const parsed = UpdateProfileSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid profile payload" },
        { status: 400 }
      );
    }

    const { notification_preferences, privacy_settings, ...profileColumns } = parsed.data;

    // Persist preferences in auth user_metadata (works seamlessly with base 19-table schema)
    if (notification_preferences || privacy_settings || profileColumns.full_name) {
      const currentMeta = (user.user_metadata || {}) as Record<string, unknown>;
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...currentMeta,
          ...(profileColumns.full_name ? { full_name: profileColumns.full_name } : {}),
          ...(notification_preferences ? { notification_preferences } : {}),
          ...(privacy_settings ? { privacy_settings } : {}),
        },
      });
    }

    if (Object.keys(profileColumns).length > 0) {
      const { error } = await admin
        .from("profiles")
        .update(profileColumns)
        .eq("id", user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data: refreshedProfile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: refreshedAuth } = await admin.auth.admin.getUserById(user.id);

    return NextResponse.json({
      profile: normalizeProfileRow(refreshedProfile || {}, refreshedAuth?.user || user),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update profile" },
      { status: 500 }
    );
  }
}
