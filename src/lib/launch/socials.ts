import { LIMITS, byteLength } from "@/lib/launch/config";

/*
 * The X, Telegram and Website links a launch writes into the token's socials.
 * Each normaliser takes what a person types and returns the exact string that
 * goes on chain, or a short reason it cannot be used. Empty is always fine.
 */

export type Normalised = { ok: true; value: string } | { ok: false; error: string };

const ok = (value: string): Normalised =>
  byteLength(value) > LIMITS.social ? { ok: false, error: `Too long for Pons (${byteLength(value)}/${LIMITS.social} bytes).` } : { ok: true, value };

function parseUrl(raw: string): URL | null {
  try {
    const withScheme = /^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withScheme);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** `@name`, `name`, x.com or twitter.com links (profile or post) → https://x.com/... */
export function normaliseX(input: string): Normalised {
  const raw = input.trim();
  if (!raw) return { ok: true, value: "" };
  const handle = raw.replace(/^@/, "");
  if (/^[A-Za-z0-9_]{1,15}$/.test(handle)) return ok(`https://x.com/${handle}`);
  const url = parseUrl(raw);
  const host = url?.hostname.replace(/^(www\.|mobile\.)/, "");
  if (url && (host === "x.com" || host === "twitter.com")) {
    const m = url.pathname.match(/^\/([A-Za-z0-9_]{1,15})(\/status\/(\d+))?\/?$/);
    if (m) return ok(`https://x.com/${m[1]}${m[3] ? `/status/${m[3]}` : ""}`);
  }
  return { ok: false, error: "Use an X handle like @yourtoken or an x.com link." };
}

/** `@name`, `name`, t.me or telegram.me links (public names or invite links) → https://t.me/... */
export function normaliseTelegram(input: string): Normalised {
  const raw = input.trim();
  if (!raw) return { ok: true, value: "" };
  const handle = raw.replace(/^@/, "");
  if (/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(handle)) return ok(`https://t.me/${handle}`);
  const url = parseUrl(raw);
  const host = url?.hostname.replace(/^www\./, "");
  if (url && (host === "t.me" || host === "telegram.me")) {
    const path = url.pathname.replace(/\/+$/, "");
    if (/^\/([A-Za-z][A-Za-z0-9_]{3,31}|\+[A-Za-z0-9_-]{8,64}|joinchat\/[A-Za-z0-9_-]{8,64})$/.test(path)) return ok(`https://t.me${path}`);
  }
  return { ok: false, error: "Use a Telegram handle like @yourtoken or a t.me link." };
}

/** Any https:// address with a real host name. */
export function normaliseWebsite(input: string): Normalised {
  const raw = input.trim();
  if (!raw) return { ok: true, value: "" };
  if (!/^https:\/\//i.test(raw)) return { ok: false, error: "Use an https:// link, for example https://yourtoken.xyz." };
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(url.hostname) || /\s/.test(raw)) throw new Error("bad");
    return ok(raw);
  } catch {
    return { ok: false, error: "That doesn't look like a web address. Try https://yourtoken.xyz." };
  }
}
