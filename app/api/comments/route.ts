import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const story_id = url.searchParams.get("story_id");
  const chapter_id = url.searchParams.get("chapter_id");

  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ comments: [] });

  let query = svc
    .from("comments")
    .select("id, user_id, story_id, chapter_id, body, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (story_id) query = query.eq("story_id", story_id);
  if (chapter_id) query = query.eq("chapter_id", chapter_id);

  const { data: comments, error } = await query;
  if (error) return NextResponse.json({ comments: [], error: error.message });

  const userIds = Array.from(new Set((comments ?? []).map((c) => c.user_id)));
  let profileMap = new Map<string, { display_name: string; avatar_url: string | null }>();
  if (userIds.length > 0) {
    const { data: profiles } = await svc
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);
    profileMap = new Map((profiles ?? []).map((p) => [p.id, { display_name: p.display_name, avatar_url: p.avatar_url }]));
  }

  const enriched = (comments ?? []).map((c) => ({
    ...c,
    display_name: profileMap.get(c.user_id)?.display_name ?? "Moonlit Reader",
    avatar_url: profileMap.get(c.user_id)?.avatar_url ?? null,
  }));

  return NextResponse.json({ comments: enriched });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const story_id = String(body.story_id ?? "").trim();
  const chapter_id = body.chapter_id ? String(body.chapter_id).trim() : null;
  const text = String(body.body ?? "").trim();

  if (!story_id) return NextResponse.json({ error: "story_id required" }, { status: 400 });
  if (!text) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  if (text.length > 4000) return NextResponse.json({ error: "Comment too long (4000 chars max)" }, { status: 400 });

  const { data, error } = await supabase
    .from("comments")
    .insert({ user_id: auth.user.id, story_id, chapter_id, body: text })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ comment: data });
}
