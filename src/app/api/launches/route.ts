import { NextResponse } from "next/server";
import { readNewest } from "@/lib/pons";

export const dynamic = "force-dynamic";

/*
 * The newest launches on Pons itself, live from its public feed, shown as
 * "elsewhere on Pons", never as ours. Launches made through Dot Family are
 * listed per browser on /launches and verified on chain there.
 */
export async function GET(request: Request) {
  const page = Number(new URL(request.url).searchParams.get("page")) || 0;
  try {
    const pons = await readNewest(page);
    return NextResponse.json(
      { pons, updated_at: Date.now(), stale: false },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { pons: null, updated_at: Date.now(), stale: true },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  }
}
