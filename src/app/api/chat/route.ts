import { NextResponse } from "next/server";
import { readStories } from "@/lib/stories";

/** The family chat: newest first, `limit` 1-50, older pages with `before=<id>`. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit")) || 30));
  const before = Number(url.searchParams.get("before")) || undefined;
  return NextResponse.json(readStories(limit, before), { headers: { "cache-control": "public, max-age=60" } });
}
