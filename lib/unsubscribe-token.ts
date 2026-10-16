// Server-only module: never import this from a "use client" component.
import { createHmac, timingSafeEqual } from "crypto";
import { SITE_URL } from "@/lib/site";

// Signs unsubscribe links so only the owner of an inbox can unsubscribe it.
// Uses UNSUBSCRIBE_SECRET if set, otherwise falls back to the Supabase service
// role key (already a server-only secret in production). Rotating whichever key
// is in use invalidates previously emailed links; readers can still request a
// fresh link from the /unsubscribe page.
function secret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function signUnsubscribeToken(email: string): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key).update(`unsubscribe:${normalizeEmail(email)}`).digest("base64url");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = signUnsubscribeToken(email);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

function query(email: string): string {
  const token = signUnsubscribeToken(email) ?? "";
  return `email=${encodeURIComponent(normalizeEmail(email))}&token=${encodeURIComponent(token)}`;
}

/** Link shown in the email footer: opens a confirmation page. */
export function unsubscribePageUrl(email: string): string {
  return `${SITE_URL}/unsubscribe?${query(email)}`;
}

/** RFC 8058 one-click endpoint used by Gmail/Yahoo's built-in "Unsubscribe" button (POST only). */
export function unsubscribeOneClickUrl(email: string): string {
  return `${SITE_URL}/api/newsletter/unsubscribe?${query(email)}`;
}

/** Headers to attach to every newsletter email. */
export function listUnsubscribeHeaders(email: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${unsubscribeOneClickUrl(email)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
