"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CHAIN, PONS } from "@/config/brand";
import { Character } from "@/components/Character";
import { ArrowUpRight, PlusIcon, RefreshIcon } from "@/components/icons";
import { KINDS } from "@/lib/characters";
import type { PonsPage } from "@/lib/pons";
import { MyLaunches } from "@/components/launches/MyLaunches";

type Feed = { pons: PonsPage | null; updated_at: number; stale: boolean };

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function Logo({ src, name, index }: { src: string | null; name: string; index: number }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <Character kind={KINDS[index % KINDS.length]} />;
  return <img src={src} alt={name} width={56} height={56} loading="lazy" onError={() => setBroken(true)} />;
}

export function LaunchBoard() {
  const [tab, setTab] = useState<"pons" | "mine">("pons");
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
      <div className="page-head">
        <div className="min-w-0">
          <p className="kicker">Launches · {CHAIN.name}</p>
          <h1 className="mt-3">Every dot gets a launch.</h1>
          <p className="mt-3 max-w-[520px] text-[16px] text-ink-soft">
            Your own launches, read back from the chain, and the newest tokens across Pons as they land.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex items-center gap-3">
            <Character kind="spark" mood="joy" className="w-14" />
            <div className="rounded-2xl bg-surface px-4 py-2.5 text-[14px]" aria-live="polite">
              <span className="font-display text-[22px]">{pons?.totalOnPons ? compact.format(pons.totalOnPons) : "—"}</span>
              <span className="ml-2 text-ink-soft">tokens on Pons</span>
            </div>
          </div>
          <Link href="/create" className="btn-primary !h-11">
            Create a dot <PlusIcon className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="seg" role="tablist" aria-label="Which launches">
          <button type="button" role="tab" aria-selected={tab === "pons"} onClick={() => setTab("pons")} data-tab="pons">
            Fresh on Pons
          </button>
          <button type="button" role="tab" aria-selected={tab === "mine"} onClick={() => setTab("mine")} data-tab="mine">
            From this browser
          </button>
        </div>
        {tab === "pons" ? (
          <div className="flex items-center gap-4 text-[13.5px] text-muted">
            {feed && pons ? <span>Updated {new Date(feed.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span> : null}
            <button type="button" className="inline-flex items-center gap-2 font-medium text-ink-soft disabled:opacity-60" disabled={loading} onClick={() => setTick((v) => v + 1)}>
              <RefreshIcon className={`size-4 ${loading ? "spin" : ""}`} /> {loading ? "Checking…" : "Refresh"}
            </button>
          </div>
        ) : null}
      </div>

      {tab === "mine" ? (
        <MyLaunches />
      ) : (
        <section className="mt-5" aria-label="Newest launches on Pons">
          <p className="text-[14px] text-muted">Live from the Pons feed. Not launched through Dot Family; shown so you can watch the chain move.</p>
          {failed ? (
            <div className="notice mt-4" role="alert">
              Pons could not be reached just now.{" "}
              <button type="button" className="underline" onClick={() => setTick((v) => v + 1)}>
                Try again
              </button>
            </div>
          ) : null}
          {!feed && loading ? <p className="mt-6 text-[16px]">Finding the dots…</p> : null}

          <div className="rows mt-4" aria-busy={loading} data-pons-grid>
            {pons?.launches.map((l, i) => (
              <a key={l.token} href={PONS.token(l.token)} target="_blank" rel="noopener noreferrer" className="launch-row" data-launch-tile>
                <Logo src={l.image} name={l.name} index={i} />
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-semibold">{l.name}</span>
                  <span className="block truncate text-[13.5px] text-muted">${l.ticker}</span>
                </span>
                <span className="row-pair text-[13.5px] text-ink-soft">{l.quote} pair</span>
                <span className="text-right">
                  <span className="block font-display text-[18px]">{l.market_cap_usd === null ? "—" : usd.format(l.market_cap_usd)}</span>
                  <span className="block text-[12px] text-muted">market cap</span>
                </span>
                <time className="row-time text-right text-[13px] text-muted" dateTime={new Date(l.created_at).toISOString()}>
                  {new Date(l.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </time>
                <ArrowUpRight className="size-4 text-muted" />
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
          <p className="mt-6 text-center text-[13px] text-muted">Market cap as reported by the Pons feed · USD</p>
        </section>
      )}
    </>
  );
}
