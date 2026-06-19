import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

function arrayField(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  for (const key of ["title", "synopsis", "status", "universe", "genre", "heat", "cover", "cover_url", "next_release"]) {
    if (key in body) updates[key] = body[key] === "" ? null : body[key];
  }
  if ("mature" in body) updates.mature = Boolean(body.mature);
  const tw = arrayField(body.trigger_warnings);
  if (tw !== undefined) updates.trigger_warnings = tw;
  const ch = arrayField(body.characters);
  if (ch !== undefined) updates.characters = ch;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { data, error } = await svc.from("stories").update(updates).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ story: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { error } = await svc.from("stories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
