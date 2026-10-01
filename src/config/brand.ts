// Single place to change project identity. Everything on the site reads from here.
// The token contract below is a placeholder until launch: paste the real
// 0x address (0x + 40 hex) into CA and the navbar, hero, footer and every copy
// button switch from "Published at launch" to a working copy.

const CA = "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

export const isAddress = (v: string): v is `0x${string}` => /^0x[0-9a-fA-F]{40}$/.test(v);

export const BRAND = {
  name: "Dot Family",
  ticker: "DOTFAMILY",
  symbol: "$DOTFAMILY",
  domain: "dotfamily.fun",
  url: "https://dotfamily.fun",
  slogan: "Your dot. Your family.",
  tagline: "Join the dot family. Create with lore. Your token.",
  description:
    "Dot Family is a playful launchpad on Robinhood Chain: pick a little character, write its lore and turn it into a token on Pons.",
  x: "https://x.com/dotfamily_fun",
  xHandle: "@dotfamily_fun",
  /** Public GitHub repository. Empty or the bare host hides every GitHub link. */
  github: "https://github.com/DotFamilyFun/DotFamily" as string,
  ca: CA,
} as const;

export const hasGithub = () => /^https:\/\/github\.com\/[^/]+/.test(BRAND.github);

// Public endpoints are the default. An operator can point server reads at a
// private RPC with ROBINHOOD_RPC_URL (optional, server only).
const PUBLIC_RPC = "https://rpc.mainnet.chain.robinhood.com";

export const CHAIN = {
  id: 4663,
  hex: "0x1237",
  name: "Robinhood Chain",
  nativeSymbol: "ETH",
  decimals: 18,
  publicRpc: PUBLIC_RPC,
  /** Second public endpoint, used for reads only when the first one fails. */
  fallbackRpc: "https://robinhood-rpc.publicnode.com",
  explorer: "https://robinhoodchain.blockscout.com",
  explorerName: "Blockscout",
} as const;

export const USDG = {
  symbol: "USDG",
  address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
  decimals: 6,
} as const;

/** Pons, the launchpad on Robinhood Chain that Dot Family launches go through. */
export const PONS = {
  name: "Pons",
  home: "https://www.ponsfamily.com/launchpad",
  token: (address: string) => `https://www.ponsfamily.com/launchpad/${address}`,
} as const;

/** RPC for server code: the private endpoint when set, else the public one. */
export function serverRpc() {
  return process.env.ROBINHOOD_RPC_URL || PUBLIC_RPC;
}

export const TOKEN = {
  get isLive() {
    return isAddress(BRAND.ca);
  },
};

export function explorerAddress(address: string) {
  return `${CHAIN.explorer}/address/${address}`;
}
export function explorerToken(address: string) {
  return `${CHAIN.explorer}/token/${address}`;
}
export function shortAddress(address: string, head = 6, tail = 4) {
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}
