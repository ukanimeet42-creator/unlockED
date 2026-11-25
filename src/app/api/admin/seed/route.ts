import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncCurriculumToDatabase } from "@/lib/seed-catalog";

const AdminInitSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10, "Administrator password must be at least 10 characters"),
  fullName: z.string().min(2).max(100).optional(),
  syncCatalogOnly: z.boolean().optional(),
});

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Controlled server-side admin provisioning & curriculum synchronization endpoint.
 * Strictly requires ADMIN_INIT_SECRET environment variable (no hardcoded fallback).
 */
export async function POST(req: Request) {
  try {
    const initSecret = process.env.ADMIN_INIT_SECRET;
    if (!initSecret || initSecret.length < 16) {
      return NextResponse.json(
        {
          error:
            "Administrator provisioning endpoint is disabled until ADMIN_INIT_SECRET (min 16 chars) is configured.",
        },
        { status: 503 }
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const expectedHeader = `Bearer ${initSecret}`;
    if (!timingSafeCompare(authHeader, expectedHeader)) {
      return NextResponse.json(
        { error: "Forbidden: Invalid administrator initialization credentials." },
        { status: 403 }
      );
    }

    const rawBody = await req.json();
    const adminClient = createAdminClient();

    if (rawBody?.syncCatalogOnly === true) {
      const synced = await syncCurriculumToDatabase(adminClient);
      return NextResponse.json({ message: "Curriculum synchronized", ...synced });
    }

    const parsed = AdminInitSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { email, password, fullName } = parsed.data;

    const { data: userData, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || "Platform Administrator",
          requested_role: "admin",
        },
      });

    if (createError || !userData.user) {
      return NextResponse.json(
        { error: createError?.message || "Failed to provision administrator" },
        { status: 400 }
      );
    }

    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: userData.user.id,
      email,
      full_name: fullName || "Platform Administrator",
      role: "admin",
      onboarding_completed: true,
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const synced = await syncCurriculumToDatabase(adminClient);

    return NextResponse.json({
      message: "Platform administrator initialized and curriculum synchronized.",
      userId: userData.user.id,
      ...synced,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Internal server error during administrator initialization",
      },
      { status: 500 }
    );
  }
}
