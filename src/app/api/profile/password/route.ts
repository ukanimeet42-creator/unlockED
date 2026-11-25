import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedContext } from "@/lib/api-auth";

const PasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export async function POST(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { supabase } = auth.ctx;

  try {
    const parsed = PasswordSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid password" },
        { status: 400 }
      );
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ updated: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update password" },
      { status: 500 }
    );
  }
}
