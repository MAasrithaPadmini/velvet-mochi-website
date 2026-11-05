import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/newsletter";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { normalizeEmail, subscribeConfirmUrl } from "@/lib/unsubscribe-token";

export const runtime = "nodejs";

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

// Same reply whatever happens, so the form can't be used to find out who is subscribed.
const CHECK_INBOX = { ok: true, pending: true };

function confirmEmailHtml(link: string): string {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
    <h2>Confirm your Velvet Mochi chapter alerts</h2>
    <p>Tap the button to start getting an email whenever a new chapter goes live.</p>
    <p><a href="${link}" style="display:inline-block;background:#c9a876;color:#111;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Yes, subscribe me</a></p>
    <p style="margin-top:24px;font-size:12px;color:#888">This link works for 7 days. If you didn't sign up, ignore this email and you won't hear from us.</p>
  </body></html>`;
}

// Double opt-in: nothing is saved here. The reader is only added to the list when
// they click the signed link in the confirmation email (see /api/newsletter/confirm).
export async function POST(request: NextRequest) {
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));

  // Honeypot: a hidden field real people never fill in. Pretend success to bots.
  if (String(body.website ?? "").trim()) return NextResponse.json(CHECK_INBOX);

  const email = normalizeEmail(String(body.email ?? ""));
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  if (!rateLimit(`newsletter-ip:${clientIp(request.headers)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a while." }, { status: 429 });
  }

  // At most one confirmation email per address every 10 minutes.
  if (!rateLimit(`newsletter-email:${email}`, 1, 10 * 60 * 1000)) {
    return NextResponse.json(CHECK_INBOX);
  }

  const { data: existing } = await svc
    .from("newsletter_subscribers")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  if (existing?.status !== "subscribed") {
    const link = subscribeConfirmUrl(email);
    if (!link) return NextResponse.json({ error: "Not configured" }, { status: 500 });
    const sent = await sendEmail(email, "Confirm your Velvet Mochi chapter alerts", confirmEmailHtml(link));
    if (!sent) {
      console.error("[newsletter] confirmation email failed to send");
      return NextResponse.json({ error: "We couldn't send the confirmation email. Please try again." }, { status: 502 });
    }
  }

  return NextResponse.json(CHECK_INBOX);
}
