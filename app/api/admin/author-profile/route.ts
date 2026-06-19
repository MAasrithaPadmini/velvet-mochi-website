import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  await requireAdmin();
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  const allowed = [
    "name",
    "tagline",
    "bio",
    "avatar_url",
    "cover_url",
    "twitter",
    "instagram",
    "tiktok",
    "goodreads",
    "website",
    "email",
    "fun_facts",
  ];
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await svc
    .from("author_profile")
    .upsert({ id: 1, ...updates })
    .eq("id", 1)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ profile: data });
}
