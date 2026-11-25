import { NextResponse } from "next/server";
import { z } from "zod";
import { createNotification, recordAuditLog, requireApiRole } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

const VerifySchema = z.object({
  companyId: z.string().min(1),
  verified: z.boolean(),
});

export async function GET() {
  const auth = await requireApiRole(["admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { admin } = auth.ctx;

  const { data, error } = await admin
    .from("companies")
    .select("*, recruiter:profiles(id, full_name, email)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ companies: data || [] });
}

export async function PATCH(req: Request) {
  const auth = await requireApiRole(["admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const parsed = VerifySchema.safeParse(await req.json());
  if (!parsed.success || !isUuid(parsed.data.companyId)) {
    return NextResponse.json({ error: "Invalid verification payload" }, { status: 400 });
  }

  const { data: updated, error } = await admin
    .from("companies")
    .update({ verified: parsed.data.verified })
    .eq("id", parsed.data.companyId)
    .select("*")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  await createNotification(admin, {
    userId: updated.recruiter_id,
    type: "system",
    title: parsed.data.verified ? "Hiring Partner Verified" : "Verification Revoked",
    message: parsed.data.verified
      ? `"${updated.name}" has been verified by UnlockED Governance.`
      : `Verification status for "${updated.name}" was revoked pending compliance review.`,
    data: { companyId: updated.id, verified: parsed.data.verified },
  });

  await recordAuditLog(admin, {
    actorId: user.id,
    action: parsed.data.verified ? "COMPANY_VERIFIED" : "COMPANY_UNVERIFIED",
    targetType: "company",
    targetId: updated.id,
  });

  return NextResponse.json({ company: updated });
}
