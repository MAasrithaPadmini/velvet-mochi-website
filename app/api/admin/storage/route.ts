import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const ALLOWED_BUCKETS = ["story-covers", "character-art", "moodboards", "author-assets"];
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  await requireAdmin();
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = form.get("file");
  const bucket = String(form.get("bucket") ?? "");
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: `Bucket must be one of: ${ALLOWED_BUCKETS.join(", ")}` }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP, or GIF images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Max file size is 5 MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error } = await svc.storage.from(bucket).upload(safeName, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: pub } = svc.storage.from(bucket).getPublicUrl(safeName);
  return NextResponse.json({ url: pub.publicUrl, path: safeName, bucket });
}
