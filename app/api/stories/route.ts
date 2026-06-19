import { NextResponse } from "next/server";
import { listStories } from "@/lib/repositories";

export async function GET() {
  const stories = await listStories();
  return NextResponse.json({
    stories,
    source: "Supabase PostgreSQL when configured, seeded demo data otherwise."
  });
}
