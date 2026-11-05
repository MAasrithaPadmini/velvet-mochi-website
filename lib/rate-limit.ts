// Small in-memory rate limiter. On Vercel each warm server instance keeps its own
// counts, so this is a speed bump against bots hammering an endpoint, not a hard
// guarantee. Good enough for the newsletter form; use a shared store if abuse grows.

const buckets = new Map<string, number[]>();

/** Returns true if the action is allowed, false if `key` hit `limit` within `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);

  // Keep memory bounded on long-lived instances.
  if (buckets.size > 5000) {
    for (const [k, times] of buckets) {
      if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
