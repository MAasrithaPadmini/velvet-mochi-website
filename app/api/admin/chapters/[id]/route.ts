import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { estimateReadingMinutes } from "@/lib/markdown";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));

  // Fetch existing chapter to detect status transitions
  const { data: existing } = await svc.from("chapters").select("*").eq("id", id).single();
  if (!existing) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  const updates: Record<string, unknown> = {};
  if ("title" in body) updates.title = String(body.title ?? "").trim();
  if ("body" in body) {
    updates.body = String(body.body ?? "");
    updates.reading_minutes = estimateReadingMinutes(String(body.body ?? ""));
  }
  if ("status" in body && ["draft", "scheduled", "published"].includes(body.status)) {
    updates.status = body.status;
  }
  if ("scheduled_for" in body) {
    updates.scheduled_for = body.scheduled_for ? new Date(body.scheduled_for).toISOString() : null;
  }

  const transitionsToPublished =
    updates.status === "published" && existing.status !== "published";
  if (transitionsToPublished) {
    updates.published_at = new Date().toISOString();
  }

  const { data: chapter, error } = await svc.from("chapters").update(updates).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Broadcast notification on first publish
  if (transitionsToPublished) {
    const { data: story } = await svc.from("stories").select("slug, title").eq("id", chapter.story_id).single();
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

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { error } = await svc.from("chapters").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
