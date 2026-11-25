import { NextResponse } from "next/server";
import { z } from "zod";
import { createNotification, normalizeProfileRow, recordAuditLog, requireApiRole } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

const PatchUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["student", "recruiter", "admin"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});

export async function GET() {
  const auth = await requireApiRole(["admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { admin } = auth.ctx;

  try {
    const [{ data: profiles, error }, authList] = await Promise.all([
      admin.from("profiles").select("*").order("created_at", { ascending: false }),
      admin.auth.admin.listUsers({ perPage: 200 }),
    ]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const authMap = new Map(
      (authList.data?.users || []).map((u) => [u.id, u])
    );

    const { data: attempts } = await admin
      .from("assessment_attempts")
      .select("student_id, passed");

    const users = (profiles || []).map((p) => {
      const authUser = authMap.get(p.id);
      const norm = normalizeProfileRow(p, authUser);
      const passedCount = (attempts || []).filter(
        (a) => a.student_id === p.id && a.passed
      ).length;

      return {
        ...norm,
        passedBenchmarks: passedCount,
      };
    });

    return NextResponse.json({ users });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load users" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const auth = await requireApiRole(["admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user: actor, admin } = auth.ctx;

  try {
    const parsed = PatchUserSchema.safeParse(await req.json());
    if (!parsed.success || !isUuid(parsed.data.userId)) {
      return NextResponse.json({ error: "Invalid user governance request" }, { status: 400 });
    }

    const { userId, role, status } = parsed.data;

    if (userId === actor.id && status === "suspended") {
      return NextResponse.json(
        { error: "Administrators cannot suspend their own active account." },
        { status: 400 }
      );
    }

    const { data: targetAuth } = await admin.auth.admin.getUserById(userId);
    if (!targetAuth?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingMeta = (targetAuth.user.user_metadata || {}) as Record<string, unknown>;

    if (status) {
      await admin.auth.admin.updateUserById(userId, {
        ban_duration: status === "suspended" ? "876000h" : "none",
        user_metadata: {
          ...existingMeta,
          account_status: status,
        },
      });
      // Attempt profile status update if migration 003 column exists
      await admin
        .from("profiles")
        .update({
          status,
          suspended_at: status === "suspended" ? new Date().toISOString() : null,
        })
        .eq("id", userId);
    }

    if (role) {
      const { error: roleErr } = await admin
        .from("profiles")
        .update({ role })
        .eq("id", userId);
      if (roleErr) return NextResponse.json({ error: roleErr.message }, { status: 500 });

      await createNotification(admin, {
        userId,
        type: "system",
        title: "Account Role Updated",
        message: `Your platform role was updated to "${role}" by an administrator.`,
        data: { role },
      });
    }

    await recordAuditLog(admin, {
      actorId: actor.id,
      action: status ? `USER_${status.toUpperCase()}` : "USER_ROLE_CHANGED",
      targetType: "profile",
      targetId: userId,
      metadata: { role, status },
    });

    const { data: refreshedProfile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    const { data: refreshedAuth } = await admin.auth.admin.getUserById(userId);

    return NextResponse.json({
      user: normalizeProfileRow(refreshedProfile || {}, refreshedAuth?.user ?? undefined),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update user" },
      { status: 500 }
    );
  }
}
