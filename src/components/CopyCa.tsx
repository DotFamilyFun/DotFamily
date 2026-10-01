"use client";

import { useState } from "react";
import { BRAND, TOKEN, explorerToken, shortAddress } from "@/config/brand";
import { CheckIcon, CopyIcon } from "@/components/icons";

function useCopyCa() {
  const [copied, setCopied] = useState(false);
  const live = TOKEN.isLive;
  const copy = async () => {
    if (!live) return;
    try {
      await navigator.clipboard.writeText(BRAND.ca);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the address stays visible to select by hand.
    }
  };
  return { live, copied, copy };
}

const soon = `${BRAND.symbol} contract is published at launch`;

/** Navbar button: ticker plus copy icon. Calm until the CA is published. */
export function NavCa() {
  const { live, copied, copy } = useCopyCa();
  return (
    <button
      type="button"
      onClick={copy}
      data-copy-ca="nav"
      title={live ? `Copy ${BRAND.symbol} contract address` : soon}
      aria-label={live ? `Copy ${BRAND.symbol} contract address` : soon}
      className={`flex h-[38px] shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px] text-pine transition-colors hover:border-line-strong ${live ? "" : "cursor-default"}`}
    >
      <span className="hidden font-medium lg:inline">CA</span>
      {copied ? <CheckIcon className="size-4 text-ok" /> : <CopyIcon className={`size-4 ${live ? "" : "opacity-45"}`} />}
    </button>
  );
}

/** Hero row: "CA" label, the full address and a round copy button. */
export function HeroCa() {
  const { live, copied, copy } = useCopyCa();
  return (
    <div className="hero-ca">
      <span className="font-medium">CA</span>
      <code data-ca-text>{live ? BRAND.ca : "Published at launch"}</code>
      <button type="button" onClick={copy} disabled={!live} data-copy-ca="hero" aria-label={live ? "Copy contract address" : soon} className="copy-round">
        {copied ? <CheckIcon className="size-4 text-ok" /> : <CopyIcon className="size-4" />}
      </button>
    </div>
  );
}

/** Footer block: short address, copy button and explorer link. */
export function FooterCa() {
  const { live, copied, copy } = useCopyCa();
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-full border border-[#d5cbe6] bg-ivory py-1 pl-4 pr-1">
      <span className="shrink-0 text-[13px] font-medium text-pine">{BRAND.symbol}</span>
      <span className="min-w-0 truncate text-[13px] text-ink">{live ? shortAddress(BRAND.ca, 6, 4) : "CA at launch"}</span>
      {live ? (
        <a href={explorerToken(BRAND.ca)} target="_blank" rel="noreferrer" className="shrink-0 text-[12px] underline-offset-2 hover:underline">
          Explorer
        </a>
      ) : null}
      <button type="button" onClick={copy} disabled={!live} data-copy-ca="footer" aria-label={live ? "Copy contract address" : soon} className="copy-round !size-8">
        {copied ? <CheckIcon className="size-4 text-ok" /> : <CopyIcon className="size-4" />}
      </button>
    </div>
  );
}
