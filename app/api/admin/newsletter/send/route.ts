import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL ?? "newsletter@yourdomain.com";
const FROM_NAME = process.env.NEWSLETTER_FROM_NAME ?? "Your Newsletter";

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: `${FROM_NAME} <${FROM_EMAIL}>`, to, subject, html }),
  });
  return res.ok;
}

function bodyToHtml(text: string): string {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
${text
  .split(/\n\n+/)
  .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
  .join("\n")}
</body></html>`;
}

export async function POST(request: NextRequest) {
  await requireAdmin();
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  if (!RESEND_API_KEY)
    return NextResponse.json({ error: "RESEND_API_KEY is not set. Add it to your environment variables." }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const subject = String(body.subject ?? "").trim();
  const message = String(body.body ?? "").trim();
  if (!subject) return NextResponse.json({ error: "Subject required" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Body required" }, { status: 400 });

  // Fetch all active subscribers
  const { data: subscribers, error: fetchError } = await svc
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "subscribed");

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 400 });

  const emails = (subscribers ?? []).map((s: { email: string }) => s.email);
  const html = bodyToHtml(message);

  // Send emails (in batches of 10 to avoid rate limits)
  let sent = 0;
  let failed = 0;
  const batchSize = 10;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const results = await Promise.all(batch.map((email) => sendEmail(email, subject, html)));
    sent += results.filter(Boolean).length;
    failed += results.filter((r) => !r).length;
  }

  // Log campaign
  const { data: campaign, error: insertError } = await svc
    .from("newsletter_campaigns")
    .insert({ subject, body: message, recipient_count: sent })
    .select("*")
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  return NextResponse.json({ campaign, recipient_count: sent, failed });
}
