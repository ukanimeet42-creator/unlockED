import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiRole } from "@/lib/api-auth";

const CompanySchema = z.object({
  name: z.string().min(2).max(120),
  industry: z.string().max(80).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  size: z.string().max(60).nullable().optional(),
  website: z.string().max(255).nullable().optional(),
  description: z.string().max(3000).nullable().optional(),
});

export async function GET() {
  const auth = await requireApiRole(["recruiter", "admin"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { data, error } = await admin
    .from("companies")
    .select("*")
    .eq("recruiter_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ company: data || null });
}

export async function PUT(req: Request) {
  const auth = await requireApiRole(["recruiter"]);
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const parsed = CompanySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid company details" },
        { status: 400 }
      );
    }

    const { data: existing } = await admin
      .from("companies")
      .select("id")
      .eq("recruiter_id", user.id)
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await admin
        .from("companies")
        .update(parsed.data)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ company: updated });
    }

    const { data: created, error } = await admin
      .from("companies")
      .insert({
        recruiter_id: user.id,
        ...parsed.data,
        verified: false,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ company: created });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save company profile" },
      { status: 500 }
    );
  }
}
