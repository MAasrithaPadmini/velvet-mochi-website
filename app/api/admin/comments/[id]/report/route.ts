import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in to report a comment" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const reason = body.reason ? String(body.reason).slice(0, 500) : null;

  const { error } = await supabase
    .from("comment_reports")
    .insert({ comment_id: id, reported_by: auth.user.id, reason });

  if (error) {
    // Unique constraint violation = already reported by this user, treat as success.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyReported: true });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
