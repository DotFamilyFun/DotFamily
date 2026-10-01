"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Address } from "viem";
import { BRAND, CHAIN, PONS } from "@/config/brand";
import { Character } from "@/components/Character";
import { useLocalStore } from "@/components/wallet/useLocalStore";
import { ArrowUpRight, PlusIcon } from "@/components/icons";
import { launchClient } from "@/lib/launch/client";
import { readLaunchedToken } from "@/lib/launch/prepare";
import type { LaunchRecord } from "@/components/create/CreateFlow";

type Verified = { name: string; symbol: string; website: string } | "missing";

/**
 * Tokens launched through Dot Family from this browser. Each one is read
 * back from the chain; the website slot shows whether it was born here.
 */
export function MyLaunches() {
  const [launches] = useLocalStore<LaunchRecord[]>("dotfamily.launches", []);
  const [verified, setVerified] = useState<Record<string, Verified>>({});

  useEffect(() => {
    if (!launches.length) return;
    let cancelled = false;
    const client = launchClient();
    for (const l of launches) {
      readLaunchedToken(client, l.token as Address)
        .then((info) => !cancelled && setVerified((v) => ({ ...v, [l.token]: { name: info.name, symbol: info.symbol, website: info.website } })))
        .catch(() => !cancelled && setVerified((v) => ({ ...v, [l.token]: "missing" })));
    }
    return () => {
      cancelled = true;
    };
  }, [launches]);

  if (!launches.length) {
    return (
      <div className="mt-5 flex flex-col items-center gap-4 rounded-[32px] border border-dashed border-line-strong bg-surface px-6 py-12 text-center" data-born-empty>
        <Character kind="dot" mood="joy" className="w-24" />
        <h2 className="text-[26px]">The next family dot could be yours.</h2>
        <p className="max-w-[480px] text-[15px] leading-relaxed text-ink-soft">
          Dots launched from this browser show up here, read back from Robinhood Chain. Every launch made on {BRAND.name} carries {BRAND.domain} in its
          on-chain website slot.
        </p>
        <Link href="/create" className="btn-primary mt-2">
          Create a dot <PlusIcon className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5" data-my-launches>
      <p className="text-[14px] text-muted">Launched from this browser · each one read back from {CHAIN.name}</p>
      <div className="rows mt-4">
        {launches.map((l, i) => {
          const v = verified[l.token];
          const ok = v && v !== "missing";
          return (
            <a key={l.token} href={PONS.token(l.token)} target="_blank" rel="noreferrer" className="launch-row">
              <Character kind={(["dot", "block", "spark", "ghost", "bean", "bloom"] as const)[i % 6]} mood="joy" />
              <span className="min-w-0">
                <span className="block truncate text-[16px] font-semibold">{ok ? v.name : l.name}</span>
                <span className="block truncate text-[13px] text-muted">
                  ${ok ? v.symbol : l.symbol} · {l.token}
                </span>
              </span>
              <span className="row-pair" />
              <span className="text-right">
                <span className="inline-block rounded-full bg-mint px-3 py-1 text-[13px] font-semibold text-brand">
                  {v === undefined ? "Checking…" : ok && v.website.includes(BRAND.domain) ? "Born here" : ok ? "On chain" : "Not found"}
                </span>
              </span>
              <span className="row-time" />
              <ArrowUpRight className="size-4 text-muted" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
