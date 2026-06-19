import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ progress: [] });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ progress: [] });

  const { data } = await supabase
    .from("reading_progress")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("updated_at", { ascending: false });
  return NextResponse.json({ progress: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const story_id = String(body.story_id ?? "").trim();
  const chapter_id = String(body.chapter_id ?? "").trim();
  const progress = Math.max(0, Math.min(100, Math.round(Number(body.progress ?? 0))));
  if (!story_id || !chapter_id) {
    return NextResponse.json({ error: "story_id and chapter_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reading_progress")
    .upsert(
      { user_id: auth.user.id, story_id, chapter_id, progress, updated_at: new Date().toISOString() },
      { onConflict: "user_id,chapter_id" }
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ progress: data });
}
