"use client";

import { createPublicClient, defineChain, http, type PublicClient } from "viem";
import { CHAIN } from "@/config/brand";

export const robinhood = defineChain({
  id: CHAIN.id,
  name: CHAIN.name,
  nativeCurrency: { name: "Ether", symbol: CHAIN.nativeSymbol, decimals: 18 },
  rpcUrls: { default: { http: [CHAIN.publicRpc] } },
  blockExplorers: { default: { name: CHAIN.explorerName, url: CHAIN.explorer } },
});

let client: PublicClient | null = null;

/** Reads go through this site's /api/rpc relay (operator RPC first, public fallbacks). */
export function launchClient(): PublicClient {
  client ??= createPublicClient({
    chain: robinhood,
    transport: http(`${window.location.origin}/api/rpc`, { retryCount: 1, timeout: 20_000 }),
    pollingInterval: 1_000,
  }) as PublicClient;
  return client;
}
