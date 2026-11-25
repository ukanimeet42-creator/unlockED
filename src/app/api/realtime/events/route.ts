import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedContext, isUserSuspended } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

async function computeScopedDigest(
  admin: SupabaseClient,
  userId: string,
  role: string
): Promise<{ digest: string; revoked: boolean }> {
  const [{ data: authData }, { data: profData }] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from("profiles").select("status").eq("id", userId).maybeSingle(),
  ]);

  if (!authData?.user || isUserSuspended(authData.user, profData)) {
    return { digest: "revoked", revoked: true };
  }

  const [notifRes, jobsRes] = await Promise.all([
    admin
      .from("notifications")
      .select("id, read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("jobs")
      .select("id, is_active, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const notifSig = (notifRes.data || [])
    .map((n) => `${n.id}:${n.read ? 1 : 0}`)
    .join(",");
  const jobSig = (jobsRes.data || [])
    .map((j) => `${j.id}:${j.is_active ? 1 : 0}:${j.updated_at}`)
    .join(",");

  if (role === "student") {
    const [appsRes, certRes, enrollRes] = await Promise.all([
      admin
        .from("applications")
        .select("id, status, updated_at")
        .eq("student_id", userId),
      admin
        .from("certificates")
        .select("id")
        .eq("student_id", userId),
      admin
        .from("enrollments")
        .select("id, progress_percentage")
        .eq("student_id", userId),
    ]);

    const appSig = (appsRes.data || [])
      .map((a) => `${a.id}:${a.status}:${a.updated_at}`)
      .join(",");
    const certSig = (certRes.data || []).length;
    const enrollSig = (enrollRes.data || [])
      .map((e) => `${e.id}:${e.progress_percentage}`)
      .join(",");

    return {
      revoked: false,
      digest: `stu|${notifSig}|${jobSig}|${appSig}|${certSig}|${enrollSig}`,
    };
  }

  if (role === "recruiter") {
    const { data: recJobs } = await admin
      .from("jobs")
      .select("id")
      .eq("recruiter_id", userId);
    const jobIds = (recJobs || []).map((j) => j.id);
    const appsRes =
      jobIds.length > 0
        ? await admin
            .from("applications")
            .select("id, status, updated_at")
            .in("job_id", jobIds)
        : { data: [] };

    const appSig = (appsRes.data || [])
      .map((a) => `${a.id}:${a.status}:${a.updated_at}`)
      .join(",");

    const { data: comp } = await admin
      .from("companies")
      .select("id, verified, updated_at")
      .eq("recruiter_id", userId)
      .maybeSingle();

    return {
      revoked: false,
      digest: `rec|${notifSig}|${jobSig}|${appSig}|${comp?.verified ? 1 : 0}:${comp?.updated_at || ""}`,
    };
  }

  // Admin scope
  const [usersRes, companiesRes, appsRes] = await Promise.all([
    admin.from("profiles").select("id, role, updated_at").order("updated_at", { ascending: false }).limit(20),
    admin.from("companies").select("id, verified").limit(30),
    admin.from("applications").select("id, status").limit(30),
  ]);

  const adminSig = [
    (usersRes.data || []).length,
    (usersRes.data || []).map((u) => `${u.id}:${u.role}`).join(","),
    (companiesRes.data || []).map((c) => `${c.id}:${c.verified}`).join(","),
    (appsRes.data || []).map((a) => `${a.id}:${a.status}`).join(","),
  ].join("|");

  return {
    revoked: false,
    digest: `adm|${notifSig}|${jobSig}|${adminSig}`,
  };
}

export async function GET(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { user, profile, admin } = auth.ctx;
  const encoder = new TextEncoder();

  // Optional single-shot snapshot for quick test verification (?once=1)
  const { searchParams } = new URL(req.url);
  if (searchParams.get("once") === "1") {
    const snap = await computeScopedDigest(admin, user.id, profile.role);
    return NextResponse.json(snap);
  }

  let cancelled = false;
  const stream = new ReadableStream({
    async start(controller) {
      const send = (eventName: string, data: Record<string, unknown>) => {
        if (cancelled) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          cancelled = true;
        }
      };

      try {
        controller.enqueue(encoder.encode("retry: 2500\n\n"));
        let prev = await computeScopedDigest(admin, user.id, profile.role);
        if (prev.revoked) {
          send("revoked", { reason: "Account suspended" });
          controller.close();
          return;
        }

        send("connected", { role: profile.role, digest: prev.digest });

        // Keep SSE window concise (~35s) before letting EventSource seamlessly reconnect
        for (let tick = 0; tick < 14 && !cancelled; tick++) {
          await new Promise((r) => setTimeout(r, 2500));
          if (cancelled || req.signal.aborted) break;

          const next = await computeScopedDigest(admin, user.id, profile.role);
          if (next.revoked) {
            send("revoked", { reason: "Account suspended" });
            break;
          }

          if (next.digest !== prev.digest) {
            prev = next;
            send("sync", { timestamp: new Date().toISOString() });
          } else if (tick % 4 === 3) {
            send("heartbeat", { ok: true });
          }
        }
      } catch {
        // Exit stream cleanly on client disconnect or error
      } finally {
        cancelled = true;
        try {
          controller.close();
        } catch {
          // Ignore double close
        }
      }
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
