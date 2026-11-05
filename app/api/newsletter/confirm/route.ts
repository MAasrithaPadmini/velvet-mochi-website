import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { normalizeEmail, verifySubscribeToken } from "@/lib/unsubscribe-token";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(String(body.email ?? ""));
  const exp = Number(body.exp);
  const token = String(body.token ?? "");

  const check = verifySubscribeToken(email, exp, token);
  if (check === "expired") {
    return NextResponse.json(
      { error: "This confirmation link has expired. Sign up again on the homepage to get a fresh one." },
      { status: 410 }
    );
  }
  if (check !== "ok") {
    return NextResponse.json({ error: "This confirmation link is invalid." }, { status: 403 });
  }

  const { error } = await svc
    .from("newsletter_subscribers")
    .upsert({ email, status: "subscribed" }, { onConflict: "email" });
  if (error) {
    console.error("[newsletter] confirm failed", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
