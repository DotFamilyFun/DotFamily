import { NextResponse } from "next/server";
import { readNewest } from "@/lib/pons";

export const dynamic = "force-dynamic";

/*
 * Two counts, kept apart on purpose:
 * - born_here: tokens launched through Dot Family. The launcher opens at
 *   launch, so this is zero and the list is empty until then.
 * - pons: the newest launches on Pons itself, live from its public feed,
 *   shown as "elsewhere on Pons", never as ours.
 */
export async function GET(request: Request) {
  const page = Number(new URL(request.url).searchParams.get("page")) || 0;
  try {
    const pons = await readNewest(page);
    return NextResponse.json(
      { born_here: { total: 0, today: 0, launches: [] }, pons, updated_at: Date.now(), stale: false },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { born_here: { total: 0, today: 0, launches: [] }, pons: null, updated_at: Date.now(), stale: true },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  }
}
