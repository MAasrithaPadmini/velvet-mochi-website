import { NextResponse } from "next/server";
import { listChapters } from "@/lib/repositories";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapters = await listChapters(searchParams.get("story") ?? undefined);
  return NextResponse.json({
    chapters,
    workflow: ["draft", "autosave", "schedule", "publish", "preview", "analytics"]
  });
}
