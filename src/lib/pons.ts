import "server-only";

/**
 * Newest launches on Pons, the launchpad on Robinhood Chain, read from its
 * public JSON feed. A failed read throws inside the helper, so it is never
 * cached; the route answers with a clear "unavailable" instead.
 */

const BASE = "https://www.ponsfamily.com";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36",
  Referer: `${BASE}/launchpad`,
  Accept: "application/json",
};

export type PonsLaunch = {
  token: string;
  name: string;
  ticker: string;
  image: string | null;
  quote: string;
  created_at: number;
  market_cap_usd: number | null;
  progress: number | null;
};

export type PonsPage = {
  launches: PonsLaunch[];
  page: number;
  next: number | null;
  totalOnPons: number | null;
  generatedAt: number;
};

type Raw = {
  token?: string;
  name?: string;
  symbol?: string;
  description?: string;
  logo?: string | null;
  launchedAt?: string;
  marketCapUsd?: number | null;
  graduationProgressPct?: number | null;
  quoteAsset?: { symbol?: string } | null;
};

/* Names and tickers are written by anyone. Rows carrying slurs or obvious
 * abuse are dropped before they reach a page that carries our name. */
const BLOCKED =
  /\b(n[i1]gg(a|er|uh)s?|f[a4]gg?(ot)?s?|k[i1]ke|ch[i1]nk|sp[i1]c|r[e3]t[a4]rd(ed)?|tr[a4]nny|coon|nazi|hitler|rape|cp|porn)\b/i;

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Logos on IPFS go through our own cached proxy; https images are used as they are. */
function image(logo: string | null | undefined) {
  if (!logo) return null;
  const cid = logo.match(/^ipfs:\/\/([A-Za-z0-9]{20,100})/)?.[1] ?? logo.match(/\/ipfs\/([A-Za-z0-9]{20,100})/)?.[1];
  if (cid) return `/api/logo/${cid}`;
  return /^https:\/\//.test(logo) ? logo : null;
}

export const PAGE_SIZE = 24;
const MAX_PAGE = 20;

export async function readNewest(page: number): Promise<PonsPage> {
  const p = Math.max(0, Math.min(MAX_PAGE, Math.floor(page)));
  const path = `/api/pons-launches?explore=1&sort=newest&age=all&page=${p + 1}&pageSize=${PAGE_SIZE}&includeGraduated=0&version=all&v=22`;
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS, next: { revalidate: 15 }, signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`pons ${res.status}`);
  const body = (await res.json()) as { active?: { items?: Raw[]; total?: number }; launchTotal?: number; generatedAt?: number };
  const items = body.active?.items ?? [];
  const launches: PonsLaunch[] = [];
  for (const r of items) {
    if (!r.token || !/^0x[0-9a-fA-F]{40}$/.test(r.token)) continue;
    if (BLOCKED.test(`${r.name ?? ""} ${r.symbol ?? ""} ${r.description ?? ""}`)) continue;
    launches.push({
      token: r.token,
      name: (r.name ?? "").trim().slice(0, 40) || "Unnamed",
      ticker: (r.symbol ?? "").trim().slice(0, 14) || "???",
      image: image(r.logo),
      quote: r.quoteAsset?.symbol ?? "ETH",
      created_at: r.launchedAt ? Date.parse(r.launchedAt) : 0,
      market_cap_usd: num(r.marketCapUsd),
      progress: num(r.graduationProgressPct),
    });
  }
  const more = items.length === PAGE_SIZE && p < MAX_PAGE;
  return {
    launches,
    page: p,
    next: more ? p + 1 : null,
    totalOnPons: num(body.launchTotal),
    generatedAt: body.generatedAt ?? Date.now(),
  };
}
