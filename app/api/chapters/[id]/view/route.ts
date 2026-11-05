import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|discord|preview|headless|lighthouse|pagespeed|curl|wget|python|axios|node-fetch/i;

// Counts one real read of a chapter. Called by the reader's browser after they
// have stayed on the page a while (see components/view-tracker.tsx), so search
// engines, link previews and quick bounces no longer inflate the numbers.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ ok: false }, { status: 400 });

  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) return NextResponse.json({ ok: true, counted: false });

  // Same visitor + same chapter counts at most once every 30 minutes.
  if (!rateLimit(`view:${clientIp(request.headers)}:${id}`, 1, 30 * 60 * 1000)) {
    return NextResponse.json({ ok: true, counted: false });
  }

  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ ok: false }, { status: 500 });

  const { data: chapter } = await svc.from("chapters").select("status").eq("id", id).maybeSingle();
  if (chapter?.status !== "published") return NextResponse.json({ ok: true, counted: false });

  const { error } = await svc.rpc("increment_chapter_views", { chapter_id_input: id });
  if (error) console.error("[views] increment failed", error);
  return NextResponse.json({ ok: true, counted: !error });
}
