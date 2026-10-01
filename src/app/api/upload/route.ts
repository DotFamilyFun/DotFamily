import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/*
 * Logo upload for launches. The picture is pinned to IPFS through Pinata with
 * the operator's key (PINATA_JWT, optional, server only) and the https gateway
 * link is what goes on chain (Pons keeps up to 512 bytes). Without the key the
 * route answers 503 "not_configured" and launches use the character artwork.
 * PINATA_GATEWAY (optional) overrides the public gateway host.
 */

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const WINDOW_MS = 10 * 60_000;
const PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > PER_WINDOW;
}

function gateway() {
  const g = process.env.PINATA_GATEWAY?.trim() || "https://ipfs.io/ipfs/";
  return g.endsWith("/") ? g : `${g}/`;
}

export async function GET() {
  return NextResponse.json({ configured: Boolean(process.env.PINATA_JWT?.trim()) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const jwt = process.env.PINATA_JWT?.trim();
  if (!jwt) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "rate_limited", message: "Too many uploads. Try again in a few minutes." }, { status: 429 });

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    file = value instanceof File ? value : null;
  } catch {
    file = null;
  }
  if (!file) return NextResponse.json({ error: "bad_request", message: "Attach one image." }, { status: 400 });
  if (!TYPES.has(file.type)) return NextResponse.json({ error: "bad_type", message: "Use a PNG, JPG, WebP or GIF image." }, { status: 415 });
  if (file.size === 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "too_large", message: "Keep the image under 4 MB." }, { status: 413 });

  const body = new FormData();
  body.append("file", file, "logo");
  body.append("pinataMetadata", JSON.stringify({ name: "dotfamily-logo" }));
  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body,
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return NextResponse.json({ error: "upstream_error", message: `The picture host answered ${res.status}.` }, { status: 502 });
    const json = (await res.json()) as { IpfsHash?: string };
    if (!json.IpfsHash) return NextResponse.json({ error: "upstream_error", message: "The picture host gave no link." }, { status: 502 });
    return NextResponse.json({ url: `${gateway()}${json.IpfsHash}` }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "upstream_unreachable", message: "The picture host could not be reached." }, { status: 502 });
  }
}
