import { NextResponse } from "next/server";
import { listChapters } from "@/lib/repositories";

// Public chapter index: titles, numbers and stats only. It used to include the
// full text of every chapter, letting anyone download a whole story in one call.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapters = await listChapters(searchParams.get("story") ?? undefined);
  return NextResponse.json({ chapters });
}
