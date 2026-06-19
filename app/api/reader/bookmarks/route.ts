import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ bookmarks: [] });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ bookmarks: [] });

  const { data } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ bookmarks: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in to bookmark" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const story_id = String(body.story_id ?? "").trim();
  const chapter_id = String(body.chapter_id ?? "").trim();
  const label = String(body.label ?? "Bookmark").trim() || "Bookmark";
  if (!story_id || !chapter_id) {
    return NextResponse.json({ error: "story_id and chapter_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .upsert(
      { user_id: auth.user.id, story_id, chapter_id, label },
      { onConflict: "user_id,chapter_id" }
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ bookmark: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in" }, { status: 401 });

  const url = new URL(request.url);
  const chapter_id =
    url.searchParams.get("chapter_id") ??
    String((await request.json().catch(() => ({}))).chapter_id ?? "");
  if (!chapter_id) return NextResponse.json({ error: "chapter_id required" }, { status: 400 });

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", auth.user.id)
    .eq("chapter_id", chapter_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
