import { NextResponse } from "next/server";
import { z } from "zod";
import { createNotification, getAuthenticatedContext } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

const UpdateStatusSchema = z.object({
  status: z.enum([
    "pending",
    "reviewed",
    "shortlisted",
    "interviewed",
    "offered",
    "rejected",
    "withdrawn",
  ]),
  interviewAt: z.string().max(80).optional().nullable(),
  recruiterNote: z.string().max(1000).optional().nullable(),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, profile, admin } = auth.ctx;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
  }

  try {
    const parsed = UpdateStatusSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid application status" }, { status: 400 });
    }

    const { data: app } = await admin
      .from("applications")
      .select("*, job:jobs(id, title, recruiter_id)")
      .eq("id", id)
      .single();

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const jobInfo = app.job as { id: string; title: string; recruiter_id: string } | null;

    if (profile.role === "student") {
      if (app.student_id !== user.id || parsed.data.status !== "withdrawn") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (profile.role === "recruiter") {
      if (!jobInfo || jobInfo.recruiter_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { data: updated, error } = await admin
      .from("applications")
      .update({ status: parsed.data.status })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: error?.message || "Update failed" }, { status: 500 });
    }

    if (profile.role !== "student") {
      const hasInterview = Boolean(parsed.data.interviewAt?.trim());
      const noteText = parsed.data.recruiterNote?.trim() || null;

      await createNotification(admin, {
        userId: app.student_id,
        type: "application_update",
        title: hasInterview
          ? `Interview Scheduled (${parsed.data.status.toUpperCase()})`
          : `Application ${parsed.data.status.toUpperCase()}`,
        message: hasInterview
          ? `Your application for "${jobInfo?.title || "Position"}" has an interview update (${parsed.data.interviewAt}).`
          : `Your application for "${jobInfo?.title || "Position"}" is now ${parsed.data.status}.`,
        data: {
          applicationId: id,
          jobId: app.job_id,
          status: parsed.data.status,
          interviewAt: parsed.data.interviewAt || null,
          recruiterNote: noteText,
        },
      });

      if (hasInterview || noteText) {
        await createNotification(admin, {
          userId: user.id,
          type: "system",
          title: `Pipeline Note Recorded`,
          message: `${parsed.data.status.toUpperCase()} update recorded for ${jobInfo?.title || "job"}.`,
          data: {
            kind: "recruiter_application_note",
            applicationId: id,
            interviewAt: parsed.data.interviewAt || null,
            recruiterNote: noteText,
          },
        });
      }
    }

    return NextResponse.json({ application: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update application" },
      { status: 500 }
    );
  }
}
