"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BRAND, CHAIN, PONS } from "@/config/brand";
import { Character } from "@/components/Character";
import { useWallet } from "@/components/wallet/WalletProvider";
import { useWalletModal } from "@/components/wallet/WalletButton";
import { ArrowRight, ArrowUpRight, CheckIcon, CopyIcon, UploadIcon } from "@/components/icons";
import { FAMILY, KINDS, isKind, type Kind } from "@/lib/characters";
import { PAIRS } from "@/lib/content";

/*
 * The launchpad, as a preview. It walks through the same three steps a launch
 * takes (token, pair and first buy, review), checks the wallet and network,
 * and saves the draft. It never sends a transaction: launching from Dot Family
 * opens at launch, and the review says so plainly.
 */

type Draft = { kind: Kind; name: string; ticker: string; story: string; pair: string; firstBuy: string };

const DEFAULT: Draft = { kind: "dot", name: "Little Pip", ticker: "PIP", story: "First to arrive, last to leave. Round in all the right places.", pair: "ETH", firstBuy: "" };
const DRAFT_KEY = "dotfamily.draft";
const STEPS = ["Your token", "Pair & buy", "Launch"];
const TITLES = ["Shape your dot.", "Who does it pair with?", "Ready when you are."];

const validName = (v: string) => v.trim().length >= 1 && v.trim().length <= 32;
const validTicker = (v: string) => /^[A-Z0-9]{1,10}$/.test(v);
const validStory = (v: string) => v.trim().length >= 1 && v.trim().length <= 180;
const validBuy = (v: string) => v === "" || (/^\d*\.?\d*$/.test(v) && Number(v) >= 0);

function draftLink(d: Draft) {
  const q = new URLSearchParams({ kind: d.kind, name: d.name.trim(), ticker: d.ticker, story: d.story.trim(), pair: d.pair });
  return `${BRAND.url}/create?${q.toString()}`;
}

export function CreateFlow() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [d, setD] = useState<Draft>(DEFAULT);
  const [upload, setUpload] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { address, onRobinhoodChain, chainId, switchNetwork, switching, balance } = useWallet();
  const { open } = useWalletModal();

  // A draft link (from the family section or an agent) fills the form.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (![...q.keys()].length) return;
    const next = { ...DEFAULT };
    const kind = q.get("kind");
    if (isKind(kind)) {
      next.kind = kind;
      if (!q.get("name")) next.name = `Little ${FAMILY[kind].name}`;
      if (!q.get("ticker")) next.ticker = FAMILY[kind].name.toUpperCase().slice(0, 10);
    }
    const name = q.get("name");
    if (name && validName(name)) next.name = name.slice(0, 32);
    const ticker = q.get("ticker")?.toUpperCase();
    if (ticker && validTicker(ticker)) next.ticker = ticker;
    const story = q.get("story");
    if (story && validStory(story)) next.story = story.slice(0, 180);
    const pair = q.get("pair")?.toUpperCase();
    if (pair && PAIRS.some((p) => p.symbol === pair)) next.pair = pair;
    // Applied after hydration; the static page renders the default draft first.
    const t = window.setTimeout(() => setD(next), 0);
    return () => window.clearTimeout(t);
  }, []);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((cur) => ({ ...cur, [key]: value }));
  const pair = PAIRS.find((p) => p.symbol === d.pair) ?? PAIRS[0];
  const step1Ok = validName(d.name) && validTicker(d.ticker) && validStory(d.story);
  const link = useMemo(() => draftLink(d), [d]);

  function onFile(file: File | undefined) {
    setUploadError(null);
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return setUploadError("Use a PNG, JPG or WebP image.");
    if (file.size > 1_000_000) return setUploadError("Keep the image under 1 MB.");
    const reader = new FileReader();
    reader.onload = () => setUpload(String(reader.result));
    reader.readAsDataURL(file);
  }

  function prepare() {
    if (!address) return open();
    if (!onRobinhoodChain) return void switchNetwork();
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, savedAt: Date.now() }));
    } catch {
      // Storage can be blocked; the draft link below still carries everything.
    }
    setDone(true);
  }

  const preview = (
    <div className="flex items-center gap-4 rounded-[22px] border p-4" style={{ background: FAMILY[d.kind].tint, borderColor: FAMILY[d.kind].color }} data-preview>
      {upload ? (
        <img src={upload} alt="" className="size-16 shrink-0 rounded-2xl object-cover" />
      ) : (
        <Character kind={d.kind} className="w-16 shrink-0" />
      )}
      <div className="min-w-0">
        <p className="truncate text-[18px]">{d.name.trim() || "Your token"}</p>
        <p className="text-[14px] text-[#5b6358]">
          ${d.ticker || "TICKER"}
          {step > 0 ? ` · ${d.pair} pair` : ""}
        </p>
      </div>
    </div>
  );

  if (done) {
    return (
      <section className="mt-10" aria-live="polite" data-create-done>
        <h1 className="text-[52px] leading-none max-sm:text-[42px]">Saved. Almost there.</h1>
        <p className="mt-3 text-[14px] text-[#6f766c]">Pons · {CHAIN.name}</p>
        <div className="sheet mt-8 grid gap-5">
          {preview}
          <div className="notice">
            <strong className="font-medium text-ink">Launching from {BRAND.name} opens at launch.</strong> Your draft is saved in this browser and
            nothing was sent: no transaction, no fee. When the launcher opens, this draft will be waiting for your wallet to review and sign.
          </div>
          <dl className="grid grid-cols-2 gap-3 text-[14px]">
            <div className="rounded-2xl bg-white p-3">
              <dt className="text-[#6f766c]">Wallet</dt>
              <dd className="mt-1 truncate">{address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—"}</dd>
            </div>
            <div className="rounded-2xl bg-white p-3">
              <dt className="text-[#6f766c]">Your ETH on {CHAIN.name}</dt>
              <dd className="mt-1">{balance ?? "…"}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  // The link is still readable below.
                }
              }}
            >
              {copied ? <CheckIcon className="size-4 text-ok" /> : <CopyIcon className="size-4" />} {copied ? "Copied" : "Copy draft link"}
            </button>
            <a href={PONS.home} target="_blank" rel="noreferrer" className="btn-outline">
              Launch on Pons now <ArrowUpRight className="size-4" />
            </a>
            <button type="button" className="link-arrow" onClick={() => setDone(false)}>
              Edit draft
            </button>
          </div>
          <p className="break-all text-[12.5px] text-[#8a9087]">{link}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h1 className="text-[52px] leading-none max-sm:text-[42px]">{TITLES[step]}</h1>
      <p className="mt-3 text-[14px] text-[#6f766c]">Pons · {CHAIN.name} · preview until launch</p>

      <ol className="mt-8 grid grid-cols-3 gap-2" aria-label="Steps">
        {STEPS.map((label, i) => (
          <li key={label} className="step-pill" data-state={i === step ? "current" : i < step ? "done" : "todo"} aria-current={i === step ? "step" : undefined}>
            <span className="step-num">{i < step ? <CheckIcon className="size-3.5" /> : i + 1}</span>
            <span className="truncate max-sm:hidden">{label}</span>
          </li>
        ))}
      </ol>

      <div className="sheet mt-7 grid gap-5">
        {preview}

        {step === 0 ? (
          <>
            <div className="grid grid-cols-6 gap-2 max-sm:grid-cols-3" role="group" aria-label="Character">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className="avatar-choice"
                  aria-pressed={!upload && d.kind === k}
                  aria-label={FAMILY[k].name}
                  onClick={() => {
                    setUpload(null);
                    set("kind", k);
                  }}
                >
                  <Character kind={k} className="w-full" />
                </button>
              ))}
            </div>
            <div>
              <button type="button" className="inline-flex items-center gap-2 text-[14px] text-[#4a5548] hover:text-ink" onClick={() => fileRef.current?.click()}>
                <UploadIcon className="size-4" /> Or use your own picture
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              {upload ? <p className="mt-1 text-[12.5px] text-[#6f766c]">Shown in this preview only; it stays in your browser.</p> : null}
              {uploadError ? <p className="mt-1 text-[13px] text-danger">{uploadError}</p> : null}
            </div>
            <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3 max-sm:grid-cols-1">
              <label className="field">
                Name
                <input value={d.name} maxLength={32} onChange={(e) => set("name", e.target.value)} aria-invalid={!validName(d.name)} />
              </label>
              <label className="field">
                Ticker
                <input
                  value={d.ticker}
                  maxLength={10}
                  onChange={(e) => set("ticker", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  aria-invalid={!validTicker(d.ticker)}
                />
              </label>
            </div>
            <label className="field">
              The lore
              <textarea rows={3} value={d.story} maxLength={180} onChange={(e) => set("story", e.target.value)} aria-invalid={!validStory(d.story)} />
              <span className="text-right text-[12px] text-[#8a9087]">{d.story.length}/180</span>
            </label>
            <button type="button" className="btn-primary h-12 w-full" disabled={!step1Ok} onClick={() => setStep(1)}>
              Choose a pair <ArrowRight className="size-4" />
            </button>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <fieldset>
              <legend className="mb-3 text-[14px] text-[#3c463b]">Launch pair</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" data-pairs>
                {PAIRS.map((p) => (
                  <button
                    key={p.symbol}
                    type="button"
                    aria-pressed={d.pair === p.symbol}
                    onClick={() => set("pair", p.symbol)}
                    className={`flex min-w-0 items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                      d.pair === p.symbol ? "border-pine bg-sage" : "border-line bg-white hover:border-line-strong"
                    }`}
                  >
                    <img src={p.logo} alt="" width={28} height={28} className="size-7 shrink-0 rounded-full" />
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium">{p.symbol}</span>
                      <span className="block truncate text-[12px] text-[#6f766c]">{p.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="field">
              First buy ({pair.symbol})
              <input inputMode="decimal" placeholder="0.0 (optional)" value={d.firstBuy} onChange={(e) => validBuy(e.target.value) && set("firstBuy", e.target.value)} />
              <span className="text-[13px] leading-relaxed text-[#6f766c]">
                Optional. The first tokens go straight to your wallet. Fees and gas are paid in ETH on {CHAIN.name}.
              </span>
            </label>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <button type="button" className="btn-outline h-12" onClick={() => setStep(0)}>
                Back
              </button>
              <button type="button" className="btn-primary h-12" onClick={() => setStep(2)}>
                Review launch <ArrowRight className="size-4" />
              </button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <dl className="grid gap-2 text-[15px]">
              {[
                ["Pair", d.pair],
                ["First buy", d.firstBuy && Number(d.firstBuy) > 0 ? `${d.firstBuy} ${d.pair}` : `0 ${d.pair}`],
                ["Paid with", `ETH from your wallet`],
                ["Picture & website", "Added automatically"],
                ["Network", `${CHAIN.name} · chain id ${CHAIN.id}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
                  <dt className="text-[#6f766c]">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="notice" data-preview-notice>
              This is a preview. Launching from {BRAND.name} opens at launch, so nothing is sent from this page yet. Your wallet will always show the full
              transaction before you sign.
            </div>
            {address && chainId !== null && !onRobinhoodChain ? (
              <p className="text-[13.5px] text-danger">Your wallet is on chain {chainId}. Switch to {CHAIN.name} to continue.</p>
            ) : null}
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <button type="button" className="btn-outline h-12" onClick={() => setStep(1)}>
                Edit
              </button>
              <button type="button" className="btn-primary h-12" onClick={prepare} disabled={switching} data-prepare>
                {!address ? "Connect wallet to continue" : !onRobinhoodChain ? (switching ? "Confirm in wallet…" : `Switch to ${CHAIN.name}`) : "Prepare launch"}
                <ArrowRight className="size-4" />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
