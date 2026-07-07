import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { error } = await svc
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed" })
    .eq("email", email);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
