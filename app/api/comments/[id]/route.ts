import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in" }, { status: 401 });

  const { id } = await params;
  // RLS policy enforces: user can delete own, admin can delete any
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
