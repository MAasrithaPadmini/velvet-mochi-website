import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { estimateReadingMinutes } from "@/lib/markdown";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await requireAdmin();
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const story_id = String(body.story_id ?? "").trim();
  const title = String(body.title ?? "").trim();
  const text = String(body.body ?? "");
  const status = ["draft", "scheduled", "published"].includes(body.status) ? body.status : "draft";
  const scheduled_for = body.scheduled_for ? new Date(body.scheduled_for).toISOString() : null;

  if (!story_id) return NextResponse.json({ error: "story_id required" }, { status: 400 });
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  if (!text.trim()) return NextResponse.json({ error: "Chapter body cannot be empty" }, { status: 400 });
  if (status === "scheduled" && !scheduled_for) {
    return NextResponse.json({ error: "Scheduled chapters need a scheduled_for date" }, { status: 400 });
  }

  // Auto-number: next number for this story
  const { data: last } = await svc
    .from("chapters")
    .select("number")
    .eq("story_id", story_id)
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const number = (last?.number ?? 0) + 1;

  const payload = {
    story_id,
    number,
    title,
    body: text,
    status,
    reading_minutes: estimateReadingMinutes(text),
    scheduled_for: status === "scheduled" ? scheduled_for : null,
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  const { data: chapter, error } = await svc.from("chapters").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Broadcast notification when publishing immediately
  if (status === "published") {
    const { data: story } = await svc.from("stories").select("slug, title").eq("id", story_id).single();
    if (story) {
      await svc.from("notifications").insert({
        user_id: null,
        title: `New chapter: ${chapter.title}`,
        body: `Chapter ${chapter.number} of ${story.title} is live.`,
        link: `/stories/${story.slug}/chapters/${chapter.number}`,
      });
    }
  }

  return NextResponse.json({ chapter });
}
