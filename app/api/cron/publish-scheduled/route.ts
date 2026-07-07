import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { notifySubscribersOfChapter } from "@/lib/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Vercel cron invokes this every 15 minutes (see vercel.json).
// Protect with CRON_SECRET so random people can't trigger publishes.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const now = new Date().toISOString();

  const { data: due, error: findErr } = await svc
    .from("chapters")
    .select("id, story_id, number, title")
    .eq("status", "scheduled")
    .lte("scheduled_for", now);

  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 });
  if (!due || due.length === 0) return NextResponse.json({ published: 0 });

  const ids = due.map((c) => c.id);
  const { error: upErr } = await svc
    .from("chapters")
    .update({ status: "published", published_at: now })
    .in("id", ids);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Fetch story slugs for the notification links
  const storyIds = Array.from(new Set(due.map((c) => c.story_id)));
  const { data: stories } = await svc.from("stories").select("id, slug, title").in("id", storyIds);
  const storyMap = new Map((stories ?? []).map((s) => [s.id, s]));

  const notifications = due.map((c) => {
    const story = storyMap.get(c.story_id);
    return {
      user_id: null,
      title: `New chapter: ${c.title}`,
      body: story ? `Chapter ${c.number} of ${story.title} is live.` : `Chapter ${c.number} is live.`,
      link: story ? `/stories/${story.slug}/chapters/${c.number}` : null,
    };
  });

  await svc.from("notifications").insert(notifications);

  // Email newsletter subscribers for each chapter that just went live.
  for (const c of due) {
    const story = storyMap.get(c.story_id);
    if (!story) continue;
    notifySubscribersOfChapter({
      storyTitle: story.title,
      storySlug: story.slug,
      chapterTitle: c.title,
      chapterNumber: c.number,
    }).catch((e) => console.error("[newsletter] send failed", e));
  }

  return NextResponse.json({ published: due.length, ids });
}
