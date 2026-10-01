import "server-only";
import { cache } from "react";
import { CHAIN, USDG, serverRpc } from "@/config/brand";

/* Server-side chain reads: balances and chain facts. One JSON-RPC batch per
   request, configured endpoint first, public fallback second. No key needed. */

type RpcCall = { method: string; params: unknown[] };

// An endpoint that just failed sits out for a minute, so every read does not
// pay its timeout again. Some networks intercept the primary host's DNS.
const benched = new Map<string, number>();
const BENCH_MS = 60_000;

function endpoints() {
  const all = [serverRpc(), CHAIN.publicRpc, CHAIN.fallbackRpc].filter((url, i, list) => list.indexOf(url) === i);
  const now = Date.now();
  const ready = all.filter((url) => (benched.get(url) ?? 0) < now);
  return ready.length ? ready : all;
}

export async function batch(calls: RpcCall[]): Promise<(unknown | null)[]> {
  if (calls.length === 0) return [];
  let lastError: unknown;
  for (const url of endpoints()) {
    try {
      const out: (unknown | null)[] = new Array(calls.length).fill(null);
      // Chunked: public endpoints reject large batches with an HTML error page.
      for (let start = 0; start < calls.length; start += 20) {
        const chunk = calls.slice(start, start + 20);
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(chunk.map((c, i) => ({ jsonrpc: "2.0", id: start + i, method: c.method, params: c.params }))),
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`rpc ${res.status}`);
        const body = (await res.json()) as { id: number; result?: unknown }[];
        if (!Array.isArray(body)) throw new Error("rpc batch unsupported");
        for (const item of body) out[item.id] = item.result ?? null;
      }
      return out;
    } catch (error) {
      benched.set(url, Date.now() + BENCH_MS);
      lastError = error;
    }
  }
  throw lastError;
}

export const ethCall = (to: string, data: string): RpcCall => ({ method: "eth_call", params: [{ to, data }, "latest"] });
export const pad = (address: string) => address.toLowerCase().replace(/^0x/, "").padStart(64, "0");

export const SEL = {
  balanceOf: "0x70a08231",
  totalSupply: "0x18160ddd",
};

export type ChainFacts = {
  ok: boolean;
  block: number | null;
  blockTime: number | null;
  gasPriceGwei: number | null;
  usdgSupply: number | null;
  readAt: string;
  latencyMs: number | null;
};

/** Live chain facts: latest block, block time, gas price and USDG in circulation. */
export const readChainFacts = cache(async (): Promise<ChainFacts> => {
  const readAt = new Date().toISOString();
  const started = Date.now();
  try {
    const [latestHex, gasHex, supplyHex] = (await batch([
      { method: "eth_blockNumber", params: [] },
      { method: "eth_gasPrice", params: [] },
      ethCall(USDG.address, SEL.totalSupply),
    ])) as (string | null)[];
    const latencyMs = Date.now() - started;
    const latest = latestHex ? Number(BigInt(latestHex)) : null;
    let blockTime: number | null = null;
    if (latest) {
      const span = 2000;
      const [a, b] = (await batch([
        { method: "eth_getBlockByNumber", params: ["0x" + latest.toString(16), false] },
        { method: "eth_getBlockByNumber", params: ["0x" + (latest - span).toString(16), false] },
      ])) as ({ timestamp: string } | null)[];
      const ta = a ? Number(BigInt(a.timestamp)) : null;
      const tb = b ? Number(BigInt(b.timestamp)) : null;
      if (ta && tb && ta > tb) blockTime = (ta - tb) / span;
    }
    return {
      ok: latest !== null,
      block: latest,
      blockTime,
      gasPriceGwei: gasHex ? Number(BigInt(gasHex)) / 1e9 : null,
      usdgSupply: supplyHex && supplyHex !== "0x" ? Number(BigInt(supplyHex)) / 10 ** USDG.decimals : null,
      readAt,
      latencyMs,
    };
  } catch {
    return { ok: false, block: null, blockTime: null, gasPriceGwei: null, usdgSupply: null, readAt, latencyMs: null };
  }
});

export type RpcReply = { result?: unknown; error?: { code: number; message: string; data?: unknown } };

/**
 * Forwards calls and returns each JSON-RPC reply as the node gave it,
 * including errors (a revert's data is what explains it). Falls back to the
 * next endpoint only when an endpoint cannot be reached at all.
 */
export async function forward(calls: RpcCall[]): Promise<RpcReply[]> {
  if (calls.length === 0) return [];
  let lastError: unknown;
  for (const url of endpoints()) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(calls.map((c, i) => ({ jsonrpc: "2.0", id: i, method: c.method, params: c.params }))),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`rpc ${res.status}`);
      const body = (await res.json()) as ({ id: number } & RpcReply)[];
      if (!Array.isArray(body)) throw new Error("rpc batch unsupported");
      const out: RpcReply[] = calls.map(() => ({ error: { code: -32603, message: "No reply" } }));
      for (const item of body) out[item.id] = item.error ? { error: item.error } : { result: item.result ?? null };
      return out;
    } catch (error) {
      benched.set(url, Date.now() + BENCH_MS);
      lastError = error;
    }
  }
  throw lastError;
}
