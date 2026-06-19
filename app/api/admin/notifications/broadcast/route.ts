import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await requireAdmin();
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const message = String(body.body ?? "").trim();
  const link = body.link ? String(body.link).trim() : null;

  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Body required" }, { status: 400 });

  const { data, error } = await svc
    .from("notifications")
    .insert({ user_id: null, title, body: message, link })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ notification: data });
}
