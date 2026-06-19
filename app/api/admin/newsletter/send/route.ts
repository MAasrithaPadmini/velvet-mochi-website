import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await requireAdmin();
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const subject = String(body.subject ?? "").trim();
  const message = String(body.body ?? "").trim();
  if (!subject) return NextResponse.json({ error: "Subject required" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Body required" }, { status: 400 });

  const { count } = await svc
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .eq("status", "subscribed");

  const { data, error } = await svc
    .from("newsletter_campaigns")
    .insert({ subject, body: message, recipient_count: count ?? 0 })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ campaign: data, recipient_count: count ?? 0 });
}
