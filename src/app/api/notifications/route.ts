import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedContext } from "@/lib/api-auth";
import { isUuid } from "@/lib/catalog";

const PatchNotifSchema = z.object({
  id: z.string().optional(),
  markAll: z.boolean().optional(),
});

export async function GET() {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  const { data, error } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data || [] });
}

export async function PATCH(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const parsed = PatchNotifSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (parsed.data.markAll) {
      await admin
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);
      return NextResponse.json({ updated: true });
    }

    if (parsed.data.id && isUuid(parsed.data.id)) {
      await admin
        .from("notifications")
        .update({ read: true })
        .eq("id", parsed.data.id)
        .eq("user_id", user.id);
      return NextResponse.json({ updated: true });
    }

    return NextResponse.json({ error: "Missing notification id or markAll" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update notifications" },
      { status: 500 }
    );
  }
}
