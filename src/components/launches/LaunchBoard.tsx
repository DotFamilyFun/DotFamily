"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PONS } from "@/config/brand";
import { Character } from "@/components/Character";
import { ArrowUpRight, PlusIcon, RefreshIcon } from "@/components/icons";
import { KINDS } from "@/lib/characters";
import type { PonsPage } from "@/lib/pons";

type Feed = { born_here: { total: number; today: number }; pons: PonsPage | null; updated_at: number; stale: boolean };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function Logo({ src, name, index }: { src: string | null; name: string; index: number }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <Character kind={KINDS[index % KINDS.length]} className="w-[96px]" />;
  return <img src={src} alt={name} width={96} height={96} loading="lazy" onError={() => setBroken(true)} />;
}

export function LaunchBoard() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [page, setPage] = useState(0);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      setLoading(true);
      setFailed(false);
    }, 0);
    fetch(`/api/launches?page=${page}`, { signal: ctrl.signal, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Unavailable");
        return (await r.json()) as Feed;
      })
      .then((f) => {
        setFeed(f);
        if (!f.pons) setFailed(true);
      })
      .catch((e: Error) => e.name !== "AbortError" && setFailed(true))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => {
      window.clearTimeout(t);
      ctrl.abort();
    };
  }, [page, tick]);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 15_000);
    return () => clearInterval(t);
  }, []);

  const pons = feed?.pons ?? null;

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6" aria-live="polite">
        <div className="flex flex-wrap gap-x-7 gap-y-2 text-[16px]">
          <span data-born-here>
            <span className="font-display text-[20px]">{feed ? feed.born_here.total : "—"}</span> born here
          </span>
          <span>
            <span className="font-display text-[20px]">{pons?.totalOnPons ? compact.format(pons.totalOnPons) : "—"}</span> launched on Pons, all time
          </span>
        </div>
        <button type="button" className="inline-flex items-center gap-2 text-[15px] text-[#4a5548] disabled:opacity-60" disabled={loading} onClick={() => setTick((v) => v + 1)}>
          <RefreshIcon className={`size-4 ${loading ? "spin" : ""}`} /> {loading ? "Checking…" : "Refresh"}
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 rounded-[28px] bg-[#f5f4ed] px-6 py-10 text-center" data-born-empty>
        <Character kind="dot" mood="joy" className="w-24" />
        <h2 className="text-[26px]">The first family dot could be yours.</h2>
        <p className="max-w-[460px] text-[15px] leading-relaxed text-[#5f665c]">
          Launching straight from Dot Family opens at launch. Tokens made here will appear on this board, confirmed on Robinhood Chain.
        </p>
        <Link href="/create" className="btn-primary mt-2">
          Create a dot <PlusIcon className="size-4" />
        </Link>
      </div>

      <section className="mt-16" aria-labelledby="pons-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Live from Pons</p>
            <h2 id="pons-title" className="mt-2 text-[32px]">
              Meanwhile, elsewhere on Pons.
            </h2>
            <p className="mt-2 text-[14px] text-[#6f766c]">The newest launches on Robinhood Chain. Not launched through Dot Family, shown so you can see the chain moving.</p>
          </div>
          {feed && pons ? (
            <p className="text-[13px] text-[#6f766c]">Updated {new Date(feed.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          ) : null}
        </div>

        {failed ? (
          <div className="notice mt-6" role="alert">
            Pons could not be reached just now.{" "}
            <button type="button" className="underline" onClick={() => setTick((v) => v + 1)}>
              Try again ↗
            </button>
          </div>
        ) : null}
        {!feed && loading ? <p className="mt-6 text-[16px]">Finding the dots…</p> : null}

        <div className="tile-grid mt-6" aria-busy={loading} data-pons-grid>
          {pons?.launches.map((l, i) => (
            <a key={l.token} href={PONS.token(l.token)} target="_blank" rel="noopener noreferrer" className="launch-tile" data-launch-tile>
              <div className="flex items-center justify-between text-[13px]">
                <span className="rounded-full bg-white px-2.5 py-1 text-[#4f5a4e]">On Pons · {l.quote}</span>
                <ArrowUpRight className="size-4" />
              </div>
              <div className="grid place-items-center py-1">
                <Logo src={l.image} name={l.name} index={i} />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-sans text-[17px] tracking-normal">{l.name}</h3>
                <span className="text-[13px] text-[#6f766c]">${l.ticker}</span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <span className="text-[13px] text-[#6f766c]">Market cap</span>
                <span className="font-display text-[19px]">{l.market_cap_usd === null ? "—" : usd.format(l.market_cap_usd)}</span>
              </div>
              <time className="text-[12.5px] text-[#8a9087]" dateTime={new Date(l.created_at).toISOString()}>
                {new Date(l.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </time>
            </a>
          ))}
        </div>

        {pons && (page > 0 || pons.next !== null) ? (
          <div className="mt-8 flex justify-center gap-3">
            <button type="button" className="btn-outline" disabled={loading || page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              Newer
            </button>
            <button type="button" className="btn-outline" disabled={loading || pons.next === null} onClick={() => pons.next !== null && setPage(pons.next)}>
              Older
            </button>
          </div>
        ) : null}
        <p className="mt-8 text-center text-[13px] text-[#6f766c]">Market cap as reported by the Pons feed · USD</p>
        <p className="mt-6 text-center">
          <Link href="/create" className="link-arrow !text-[16px]">
            One more dot? <ArrowUpRight className="size-4" />
          </Link>
        </p>
      </section>
    </>
  );
}
