import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ notifications: [] });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ notifications: [] });

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .or(`user_id.eq.${auth.user.id},user_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ notifications: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // RLS only allows updating own notifications (broadcast notifications can't be marked-per-user this way)
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
