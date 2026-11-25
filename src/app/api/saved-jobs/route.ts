import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

const ToggleSaveSchema = z.object({
  jobId: z.string().min(1),
});

export async function POST(req: Request) {
  const auth = await requireApiRole(["student"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const parsed = ToggleSaveSchema.safeParse(await req.json());
    if (!parsed.success || !isUuid(parsed.data.jobId)) {
      return NextResponse.json({ error: "Invalid jobId" }, { status: 400 });
    }

    const { data: existing } = await admin
      .from("saved_jobs")
      .select("id")
      .eq("student_id", user.id)
      .eq("job_id", parsed.data.jobId)
      .maybeSingle();

    if (existing) {
      await admin.from("saved_jobs").delete().eq("id", existing.id);
      return NextResponse.json({ saved: false });
    }

    const { error } = await admin.from("saved_jobs").insert({
      student_id: user.id,
      job_id: parsed.data.jobId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to toggle saved job" },
      { status: 500 }
    );
  }
}
