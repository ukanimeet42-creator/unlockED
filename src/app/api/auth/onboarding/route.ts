import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedContext, createNotification, normalizeProfileRow } from "@/lib/api-auth";

const OnboardingSchema = z.object({
  role: z.enum(["student", "recruiter"]), // Strictly never allows 'admin'
  full_name: z.string().min(2).max(100),
  bio: z.string().max(1500).optional(),
  location: z.string().max(120).optional(),
  interests: z.array(z.string().max(60)).max(12).optional(),
  company_name: z.string().max(120).optional(),
  company_industry: z.string().max(80).optional(),
  company_website: z.string().max(255).optional(),
});

export async function POST(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  try {
    const raw = await req.json();
    const parsed = OnboardingSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid onboarding fields" },
        { status: 400 }
      );
    }

    const {
      role: requestedRole,
      full_name,
      bio,
      location,
      interests,
      company_name,
      company_industry,
      company_website,
    } = parsed.data;

    // Never allow downgrading/mutating an already-assigned admin role through onboarding
    const assignedRole = profile.role === "admin" ? "admin" : requestedRole;

    const existingMeta = (user.user_metadata || {}) as Record<string, unknown>;
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...existingMeta,
        full_name,
        interests: interests || [],
      },
    });

    const { data: updatedProfile, error: updateErr } = await admin
      .from("profiles")
      .update({
        role: assignedRole,
        full_name: full_name.trim(),
        bio: bio?.trim() || null,
        location: location?.trim() || null,
        onboarding_completed: true,
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (updateErr || !updatedProfile) {
      return NextResponse.json(
        { error: updateErr?.message || "Failed to update profile" },
        { status: 500 }
      );
    }

    if (assignedRole === "recruiter" && company_name?.trim()) {
      const { data: existingCompany } = await admin
        .from("companies")
        .select("id")
        .eq("recruiter_id", user.id)
        .maybeSingle();

      if (!existingCompany) {
        await admin.from("companies").insert({
          recruiter_id: user.id,
          name: company_name.trim(),
          industry: company_industry?.trim() || "Technology",
          website: company_website?.trim() || null,
          location: location?.trim() || null,
          verified: false,
        });
      }
    }

    await createNotification(admin, {
      userId: user.id,
      type: "system",
      title: "Workspace Ready",
      message: `Welcome to UnlockED, ${full_name.trim()}. Your ${assignedRole} workspace is active.`,
      data: { role: assignedRole },
    });

    return NextResponse.json({
      profile: normalizeProfileRow(updatedProfile, user),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Onboarding failed" },
      { status: 500 }
    );
  }
}
