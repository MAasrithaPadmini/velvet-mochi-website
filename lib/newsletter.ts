import { createServiceClient } from "@/lib/supabase/service";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL ?? "";
const FROM_NAME = process.env.NEWSLETTER_FROM_NAME ?? "Velvet Mochi";
const SITE_URL = "https://www.velvetmochi.com";

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: `${FROM_NAME} <${FROM_EMAIL}>`, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function chapterEmailHtml(storyTitle: string, chapterTitle: string, chapterNumber: number, url: string, recipientEmail: string): string {
  const unsubUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
    <h2>${storyTitle}</h2>
    <p>Chapter ${chapterNumber}: ${chapterTitle} just went live.</p>
    <p><a href="${url}" style="display:inline-block;background:#c9a876;color:#111;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Read now</a></p>
    <p style="margin-top:24px;font-size:12px;color:#888">
      You're receiving this because you subscribed to Velvet Mochi updates.
      <a href="${unsubUrl}" style="color:#888">Unsubscribe</a>
    </p>
  </body></html>`;
}

/**
 * Emails every subscribed reader that a new chapter has gone live.
 * Silently no-ops (and logs) if Resend isn't configured, so publishing
 * a chapter never fails just because email isn't set up yet.
 */
export async function notifySubscribersOfChapter(params: {
  storyTitle: string;
  storySlug: string;
  chapterTitle: string;
  chapterNumber: number;
}): Promise<{ sent: number; skipped: boolean }> {
  if (!RESEND_API_KEY || !FROM_EMAIL) {
    console.warn("[newsletter] RESEND_API_KEY or NEWSLETTER_FROM_EMAIL not set — skipping chapter email.");
    return { sent: 0, skipped: true };
  }

  const svc = createServiceClient();
  if (!svc) return { sent: 0, skipped: true };

  const { data: subscribers } = await svc
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "subscribed");

  const emails = (subscribers ?? []).map((s: { email: string }) => s.email);
  if (emails.length === 0) return { sent: 0, skipped: false };

  const url = `${SITE_URL}/stories/${params.storySlug}/chapters/${params.chapterNumber}`;
  const subject = `New chapter: ${params.storyTitle} — Ch. ${params.chapterNumber}`;

  let sent = 0;
  const batchSize = 10;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((email) =>
        sendEmail(email, subject, chapterEmailHtml(params.storyTitle, params.chapterTitle, params.chapterNumber, url, email))
      )
    );
    sent += results.filter(Boolean).length;
  }

  return { sent, skipped: false };
}
