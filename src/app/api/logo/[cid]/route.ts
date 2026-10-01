/**
 * Launch logos live on IPFS behind the Pons image proxy, which expects a
 * browser referer. This route fetches them server side and serves them with
 * a long cache, so pages never hotlink a third-party proxy.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ cid: string }> }) {
  const { cid } = await ctx.params;
  if (!/^[A-Za-z0-9]{20,100}$/.test(cid)) return new Response("bad cid", { status: 400 });
  try {
    const res = await fetch(`https://www.ponsfamily.com/api/ipfs/content/${cid}?variant=card`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36",
        Referer: "https://www.ponsfamily.com/launchpad",
      },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/") || type.includes("svg")) return new Response("not found", { status: 404 });
    return new Response(await res.arrayBuffer(), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
    });
  } catch {
    return new Response("upstream error", { status: 502 });
  }
}
