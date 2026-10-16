import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/newsletter";
import { normalizeEmail, unsubscribePageUrl, verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

export const runtime = "nodejs";

const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

async function readInput(request: NextRequest): Promise<{ email: string; token: string }> {
  const url = new URL(request.url);
  let email = url.searchParams.get("email") ?? "";
  let token = url.searchParams.get("token") ?? "";

  // The confirmation page posts JSON. Mail providers' one-click button posts a
  // form body ("List-Unsubscribe=One-Click") with email/token in the query string.
  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    email = String(body.email ?? email);
    token = String(body.token ?? token);
  }
  return { email: normalizeEmail(email), token: token.trim() };
}

function confirmationEmailHtml(link: string): string {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
    <h2>Unsubscribe from Velvet Mochi</h2>
    <p>Someone (hopefully you) asked to stop chapter emails for this address.</p>
    <p><a href="${link}" style="display:inline-block;background:#c9a876;color:#111;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Confirm unsubscribe</a></p>
    <p style="margin-top:24px;font-size:12px;color:#888">If you didn't ask for this, ignore this email and nothing will change.</p>
  </body></html>`;
}

export async function POST(request: NextRequest) {
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { email, token } = await readInput(request);
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  // Signed link from one of our emails: unsubscribe straight away.
  if (token) {
    if (!verifyUnsubscribeToken(email, token)) {
      return NextResponse.json(
        { error: "This unsubscribe link is invalid or out of date. Enter your email below and we'll send a fresh one." },
        { status: 403 }
      );
    }
    const { error } = await svc.from("newsletter_subscribers").update({ status: "unsubscribed" }).eq("email", email);
    if (error) {
      console.error("[unsubscribe] update failed", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, unsubscribed: true });
  }

  // No token (typed-in email, or an old email sent before links were signed):
  // email a signed confirmation link to that inbox. The response is identical
  // whether or not the address is subscribed, so it can't be used to look up readers.
  const { data: subscriber } = await svc
    .from("newsletter_subscribers")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  if (subscriber?.status === "subscribed") {
    const sent = await sendEmail(email, "Confirm you want to unsubscribe", confirmationEmailHtml(unsubscribePageUrl(email)));
    if (!sent) console.error("[unsubscribe] confirmation email failed to send");
  }

  return NextResponse.json({ ok: true, confirmationSent: true });
}
