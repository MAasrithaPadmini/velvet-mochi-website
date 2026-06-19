import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

export async function POST(request: NextRequest) {
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const { error } = await svc
    .from("newsletter_subscribers")
    .upsert({ email, status: "subscribed" }, { onConflict: "email" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
