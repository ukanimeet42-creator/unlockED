import crypto from "crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/api-auth";
import { FILE_UPLOAD } from "@/lib/constants";

export async function POST(req: Request) {
  const auth = await getAuthenticatedContext();
  if (auth.errorResponse) return auth.errorResponse;
  const { user, admin } = auth.ctx;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type as (typeof FILE_UPLOAD.ALLOWED_IMAGE_TYPES)[number])) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, or GIF images are supported." },
        { status: 400 }
      );
    }

    if (file.size > FILE_UPLOAD.MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds ${FILE_UPLOAD.MAX_SIZE_MB}MB limit.` },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "png";
    const path = `${user.id}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error } = await admin.storage
      .from("project-media")
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = admin.storage.from("project-media").getPublicUrl(path);
    return NextResponse.json({ url: urlData.publicUrl, path });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
