import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function arrayField(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(request: NextRequest) {
  await requireAdmin();
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const slug = String(body.slug ?? "").trim().toLowerCase();
  const title = String(body.title ?? "").trim();
  const synopsis = String(body.synopsis ?? "").trim();

  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "Slug must be lowercase letters, numbers, and hyphens." }, { status: 400 });
  }
  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!synopsis) return NextResponse.json({ error: "Synopsis is required." }, { status: 400 });

  const payload = {
    slug,
    title,
    synopsis,
    status: body.status === "published" ? "published" : "draft",
    universe: String(body.universe ?? "Velvet Archive").trim() || "Velvet Archive",
    genre: String(body.genre ?? "Dark romance").trim() || "Dark romance",
    heat: String(body.heat ?? "Slow burn").trim() || "Slow burn",
    cover: String(body.cover ?? "from-burgundy via-plum to-black").trim() || "from-burgundy via-plum to-black",
    cover_url: body.cover_url ? String(body.cover_url) : null,
    trigger_warnings: arrayField(body.trigger_warnings),
    characters: arrayField(body.characters),
    mature: body.mature === false ? false : true,
    next_release: String(body.next_release ?? "Unscheduled").trim() || "Unscheduled",
  };

  const { data, error } = await svc.from("stories").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ story: data });
}
