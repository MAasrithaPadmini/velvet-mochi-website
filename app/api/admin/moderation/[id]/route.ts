import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action as string;

  if (action === "dismiss") {
    const { error } = await svc.from("comment_reports").update({ status: "dismissed" }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    const comment_id = String(body.comment_id ?? "");
    if (comment_id) {
      await svc.from("comments").delete().eq("id", comment_id);
    }
    const { error } = await svc.from("comment_reports").update({ status: "actioned" }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
