"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatEther, parseEther, type Address, type Hex } from "viem";
import { BRAND, CHAIN, PONS, explorerAddress, shortAddress } from "@/config/brand";
import { Character } from "@/components/Character";
import { useWallet } from "@/components/wallet/WalletProvider";
import { useWalletModal } from "@/components/wallet/WalletButton";
import { useLocalStore } from "@/components/wallet/useLocalStore";
import { AlertIcon, ArrowRight, ArrowUpRight, CheckIcon, CopyIcon, UploadIcon } from "@/components/icons";
import { FAMILY, KINDS, isKind, type Kind } from "@/lib/characters";
import { PAIRS } from "@/lib/content";
import { launchClient } from "@/lib/launch/client";
import { LIMITS, PAIR_ADDRESSES, byteLength } from "@/lib/launch/config";
import { PLAN_MAX_AGE_MS, describeError, parseLaunched, prepareLaunch, readLaunchedToken, type LaunchPlan } from "@/lib/launch/prepare";

/*
 * The launchpad. Three steps (token, pair and first buy, review), then a real
 * Pons V2 launch on Robinhood Chain, signed and paid by the visitor's own
 * wallet. Every term is read live and dry-run before the wallet prompt.
 */

type Draft = { kind: Kind; name: string; ticker: string; story: string; pair: string; firstBuy: string; feePct: string; x: string };

const DEFAULT: Draft = {
  kind: "dot",
  name: "Little Pip",
  ticker: "PIP",
  story: "First to arrive, last to leave. Round in all the right places.",
  pair: "ETH",
  firstBuy: "",
  feePct: "0",
  x: "",
};
const STEPS = ["Your token", "Pair & buy", "Launch"];
const TITLES = ["Shape your dot.", "Who does it pair with?", "Ready when you are."];

const validName = (v: string) => v.trim().length >= 1 && byteLength(v.trim()) <= 32;
const validTicker = (v: string) => /^[A-Z0-9]{1,10}$/.test(v);
const validStory = (v: string) => v.trim().length >= 1 && v.trim().length <= 180;
const validBuy = (v: string) => /^\d*\.?\d{0,18}$/.test(v);
const validX = (v: string) => v === "" || /^https:\/\/(x|twitter)\.com\/[A-Za-z0-9_]{1,15}(\/status\/\d+)?\/?$/.test(v.trim());
const validFee = (v: string) => /^\d{0,2}(\.\d{0,2})?$/.test(v) && Number(v || 0) <= 10;

function draftLink(d: Draft) {
  const q = new URLSearchParams({ kind: d.kind, name: d.name.trim(), ticker: d.ticker, story: d.story.trim(), pair: d.pair });
  return `${BRAND.url}/create?${q.toString()}`;
}

const eth = (wei: bigint, digits = 6) => {
  const [w, f = ""] = formatEther(wei).split(".");
  const frac = f.slice(0, digits).replace(/0+$/, "");
  return frac ? `${w}.${frac}` : w;
};

type Phase =
  | { kind: "idle" }
  | { kind: "preparing" }
  | { kind: "signing" }
  | { kind: "pending"; hash: Hex }
  | { kind: "confirmed"; hash: Hex; token: Address; name: string; symbol: string; supply: bigint }
  | { kind: "failed"; message: string; hash?: Hex };

export type LaunchRecord = { token: Address; name: string; symbol: string; hash: Hex; at: number };

export function CreateFlow() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(DEFAULT);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<{ busy: boolean; error: string | null }>({ busy: false, error: null });
  const [uploadConfigured, setUploadConfigured] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [plan, setPlan] = useState<LaunchPlan | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [launches, saveLaunches] = useLocalStore<LaunchRecord[]>("dotfamily.launches", []);
  const fileRef = useRef<HTMLInputElement>(null);
  const { address, onRobinhoodChain, chainId, switchNetwork, switching, sendTransaction } = useWallet();
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

  useEffect(() => {
    fetch("/api/upload")
      .then((r) => r.json())
      .then((b: { configured?: boolean }) => setUploadConfigured(Boolean(b.configured)))
      .catch(() => setUploadConfigured(false));
  }, []);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setD((cur) => ({ ...cur, [key]: value }));
    setPlan(null);
  };
  const pair = PAIRS.find((p) => p.symbol === d.pair) ?? PAIRS[0];
  const nativePair = d.pair === "ETH";
  const step1Ok = validName(d.name) && validTicker(d.ticker) && validStory(d.story) && validX(d.x);
  const step2Ok = validFee(d.feePct) && (nativePair ? validBuy(d.firstBuy) : true);
  const link = useMemo(() => draftLink(d), [d]);
  const logo = logoUrl ?? `${BRAND.url}/characters/${d.kind}.webp`;
  const firstBuyWei = nativePair && d.firstBuy && Number(d.firstBuy) > 0 ? parseEther(d.firstBuy as `${number}`) : 0n;

  const input = useMemo(
    () =>
      address
        ? {
            account: address as Address,
            name: d.name.trim(),
            symbol: d.ticker,
            logo,
            description: d.story.trim(),
            website: BRAND.url,
            twitter: d.x.trim().replace("https://twitter.com/", "https://x.com/"),
            pairToken: PAIR_ADDRESSES[d.pair],
            creatorTaxBps: Math.round(Number(d.feePct || 0) * 100),
            firstBuyWei,
          }
        : null,
    [address, d, logo, firstBuyWei],
  );

  const prepare = useCallback(async () => {
    if (!input) return null;
    setPhase({ kind: "preparing" });
    try {
      const p = await prepareLaunch(launchClient(), input);
      setPlan(p);
      setPhase({ kind: "idle" });
      return p;
    } catch (error) {
      setPlan(null);
      setPhase({ kind: "failed", message: `Could not read Pons right now: ${describeError(error)}` });
      return null;
    }
  }, [input]);

  // Prepare as soon as the review opens on the right network with a wallet.
  useEffect(() => {
    if (step !== 2 || !input || !onRobinhoodChain || plan) return;
    const t = window.setTimeout(() => void prepare(), 0);
    return () => window.clearTimeout(t);
  }, [step, input, onRobinhoodChain, plan, prepare]);

  async function launch() {
    if (!address) return open();
    if (!onRobinhoodChain) return void switchNetwork();
    let p = plan;
    if (!p || Date.now() - p.preparedAt > PLAN_MAX_AGE_MS) p = await prepare();
    if (!p?.ready) return;
    setPhase({ kind: "signing" });
    let hash: Hex;
    try {
      hash = await sendTransaction({ to: p.to, data: p.data, value: p.value });
    } catch (error) {
      setPhase({ kind: "failed", message: describeError(error) });
      return;
    }
    setPhase({ kind: "pending", hash });
    try {
      const client = launchClient();
      const receipt = await client.waitForTransactionReceipt({ hash, timeout: 180_000 });
      if (receipt.status !== "success") {
        setPhase({ kind: "failed", hash, message: "The transaction reverted on chain. The network fee was spent; no token was launched." });
        return;
      }
      const launched = parseLaunched(receipt);
      if (!launched) {
        setPhase({ kind: "failed", hash, message: "Confirmed, but no launch event was found. Check the transaction in the explorer." });
        return;
      }
      const info = await readLaunchedToken(client, launched.token);
      saveLaunches([{ token: launched.token, name: info.name, symbol: info.symbol, hash, at: Date.now() }, ...launches].slice(0, 30));
      setPhase({ kind: "confirmed", hash, token: launched.token, name: info.name, symbol: info.symbol, supply: info.totalSupply });
    } catch (error) {
      setPhase({ kind: "failed", hash, message: `Sent, but the confirmation could not be read: ${describeError(error)} Check the transaction in the explorer.` });
    }
  }

  async function onFile(file: File | undefined) {
    setUploadState({ busy: false, error: null });
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) return setUploadState({ busy: false, error: "Use a PNG, JPG, WebP or GIF image." });
    if (file.size > 4 * 1024 * 1024) return setUploadState({ busy: false, error: "Keep the image under 4 MB." });
    setUploadState({ busy: true, error: null });
    try {
      const body = new FormData();
      body.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body });
      const json = (await r.json()) as { url?: string; error?: string; message?: string };
      if (r.status === 503) {
        setUploadConfigured(false);
        throw new Error("Logo upload is not configured on this site yet.");
      }
      if (!r.ok || !json.url) throw new Error(json.message ?? "The upload did not finish.");
      if (byteLength(json.url) > LIMITS.logo) throw new Error("The picture link is too long for Pons.");
      setLogoUrl(json.url);
      setUploadPreview(URL.createObjectURL(file));
      setPlan(null);
      setUploadState({ busy: false, error: null });
    } catch (error) {
      setUploadState({ busy: false, error: error instanceof Error ? error.message : "The upload did not finish." });
    }
  }

  const preview = (
    <div className="token-card" style={{ background: FAMILY[d.kind].tint, borderColor: FAMILY[d.kind].color }} data-preview>
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-surface px-3 py-1 text-[12.5px] font-semibold text-ink-soft">{step > 0 ? `${d.pair} pair` : "Pons V2"}</span>
        <span className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Token card</span>
      </div>
      <div className="mt-4 grid place-items-center">
        {uploadPreview ? <img src={uploadPreview} alt="" className="size-32 rounded-3xl object-cover" /> : <Character kind={d.kind} className="w-32" />}
      </div>
      <p className="mt-4 truncate font-display text-[26px] leading-tight">{d.name.trim() || "Your token"}</p>
      <p className="text-[15px] font-semibold text-ink-soft">${d.ticker || "TICKER"}</p>
      <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-ink-soft">{d.story.trim() || "Your lore goes here."}</p>
    </div>
  );

  if (phase.kind === "confirmed") {
    return (
      <section className="mx-auto mt-6 max-w-[640px]" aria-live="polite" data-launch-success>
        <h1 className="text-[52px] leading-none max-sm:text-[42px]">It&apos;s alive.</h1>
        <p className="mt-3 text-[14px] text-muted">Launched on Pons · {CHAIN.name}</p>
        <div className="sheet mt-8 grid gap-5">
          <div className="flex items-center gap-4 rounded-[22px] border p-4" style={{ background: FAMILY[d.kind].tint, borderColor: FAMILY[d.kind].color }}>
            {uploadPreview ? <img src={uploadPreview} alt="" className="size-16 shrink-0 rounded-2xl object-cover" /> : <Character kind={d.kind} mood="joy" className="w-16 shrink-0" />}
            <div className="min-w-0">
              <p className="truncate text-[18px]" data-launched-name>
                {phase.name}
              </p>
              <p className="text-[14px] text-ink-soft">
                ${phase.symbol} · supply {Number(formatEther(phase.supply)).toLocaleString("en-US")}
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-[13px] text-muted">Token contract</p>
            <p className="mt-1 break-all text-[15px]" data-launched-token>
              {phase.token}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(phase.token);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    // The address stays readable above.
                  }
                }}
              >
                {copied ? <CheckIcon className="size-4 text-ok" /> : <CopyIcon className="size-4" />} {copied ? "Copied" : "Copy address"}
              </button>
              <a href={PONS.token(phase.token)} target="_blank" rel="noreferrer" className="btn-outline">
                Open on Pons <ArrowUpRight className="size-4" />
              </a>
              <a href={`${CHAIN.explorer}/token/${phase.token}`} target="_blank" rel="noreferrer" className="btn-outline">
                Explorer <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
          <p className="text-[13px] text-muted">
            Transaction{" "}
            <a className="underline" href={`${CHAIN.explorer}/tx/${phase.hash}`} target="_blank" rel="noreferrer">
              {shortAddress(phase.hash, 10, 8)}
            </a>
            . The website slot on chain points to {BRAND.domain}, so anyone can see this dot was born here.
          </p>
          <button
            type="button"
            className="link-arrow"
            onClick={() => {
              setPhase({ kind: "idle" });
              setPlan(null);
              setStep(0);
            }}
          >
            Make another dot <ArrowRight className="size-4" />
          </button>
        </div>
      </section>
    );
  }

  const busy = phase.kind === "preparing" || phase.kind === "signing" || phase.kind === "pending";

  return (
    <section className="mt-6">
      <p className="kicker">
        Launchpad · {CHAIN.name} · chain id {CHAIN.id}
      </p>
      <h1 className="mt-3 text-[52px] leading-none max-sm:text-[40px]">{TITLES[step]}</h1>
      <div className="create-grid">
        <aside className="create-aside">
          {preview}
          <ol className="vsteps" aria-label="Steps">
            {STEPS.map((label, i) => (
              <li key={label} className="vstep" data-state={i === step ? "current" : i < step ? "done" : "todo"} aria-current={i === step ? "step" : undefined}>
                <span className="step-dot">{i < step ? <CheckIcon className="size-3.5" /> : i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        </aside>
      <div className="sheet grid gap-5">
        {step === 0 ? (
          <>
            <div className="grid grid-cols-6 gap-2 max-sm:grid-cols-3" role="group" aria-label="Character">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className="avatar-choice"
                  aria-pressed={!logoUrl && d.kind === k}
                  aria-label={FAMILY[k].name}
                  onClick={() => {
                    setLogoUrl(null);
                    setUploadPreview(null);
                    set("kind", k);
                  }}
                >
                  <Character kind={k} className="w-full" />
                </button>
              ))}
            </div>
            <div>
              {uploadConfigured === false ? (
                <p className="text-[13.5px] text-muted" data-upload-off>
                  Logo upload is not configured on this site yet. Your dot&apos;s character art is used as the token picture.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={uploadState.busy || uploadConfigured === null}
                    className="inline-flex items-center gap-2 text-[14px] text-ink-soft hover:text-ink disabled:opacity-50"
                    onClick={() => fileRef.current?.click()}
                  >
                    <UploadIcon className="size-4" /> {uploadState.busy ? "Uploading…" : logoUrl ? "Use a different picture" : "Or upload your own picture"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
                </>
              )}
              {logoUrl ? <p className="mt-1 break-all text-[12.5px] text-muted">Pinned: {logoUrl}</p> : null}
              {uploadState.error ? <p className="mt-1 text-[13px] text-danger">{uploadState.error}</p> : null}
            </div>
            <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3 max-sm:grid-cols-1">
              <label className="field">
                Name
                <input value={d.name} maxLength={32} onChange={(e) => set("name", e.target.value)} aria-invalid={!validName(d.name)} />
              </label>
              <label className="field">
                Ticker
                <input value={d.ticker} maxLength={10} onChange={(e) => set("ticker", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} aria-invalid={!validTicker(d.ticker)} />
              </label>
            </div>
            <label className="field">
              The lore
              <textarea rows={3} value={d.story} maxLength={180} onChange={(e) => set("story", e.target.value)} aria-invalid={!validStory(d.story)} />
              <span className="text-right text-[12px] text-muted">{d.story.length}/180</span>
            </label>
            <label className="field">
              X link (optional)
              <input value={d.x} placeholder="https://x.com/yourdot" onChange={(e) => set("x", e.target.value)} aria-invalid={!validX(d.x)} />
              {!validX(d.x) ? <span className="text-[12.5px] text-danger">Use an x.com profile or post link.</span> : null}
            </label>
            <button type="button" className="btn-primary h-12 w-full" disabled={!step1Ok} onClick={() => setStep(1)}>
              Choose a pair <ArrowRight className="size-4" />
            </button>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <fieldset>
              <legend className="mb-3 text-[14px] text-ink-soft">Launch pair</legend>
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
                      <span className="block truncate text-[12px] text-muted">{p.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="field">
              First buy (ETH)
              <input
                inputMode="decimal"
                placeholder={nativePair ? "0.0 (optional)" : "ETH pairs only"}
                value={nativePair ? d.firstBuy : ""}
                disabled={!nativePair}
                onChange={(e) => validBuy(e.target.value) && set("firstBuy", e.target.value)}
                data-first-buy
              />
              <span className="text-[13px] leading-relaxed text-muted">
                {nativePair
                  ? "Optional. Bought in the same transaction as the launch, so nobody can trade in between. The tokens go to your wallet."
                  : `A first buy on a ${pair.symbol} pair needs a token approval first. Launch here, then buy on Pons.`}
              </span>
            </label>
            <label className="field">
              Creator fee (%)
              <input inputMode="decimal" value={d.feePct} onChange={(e) => validFee(e.target.value) && set("feePct", e.target.value)} data-creator-fee />
              <span className="text-[13px] leading-relaxed text-muted">A share of trading fees paid to your wallet. Pons caps it; the live cap is checked on review.</span>
            </label>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <button type="button" className="btn-outline h-12" onClick={() => setStep(0)}>
                Back
              </button>
              <button type="button" className="btn-primary h-12" disabled={!step2Ok} onClick={() => setStep(2)}>
                Review launch <ArrowRight className="size-4" />
              </button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            {!address ? (
              <div className="notice">Connect the wallet that will launch and pay. It becomes the token&apos;s deployer and creator fee recipient.</div>
            ) : !onRobinhoodChain ? (
              <p className="notice !text-danger" data-wrong-network>
                Your wallet is on chain {chainId ?? "unknown"}. Switch to {CHAIN.name} (chain id {CHAIN.id}) to review the launch.
              </p>
            ) : null}

            {plan ? (
              <div className="grid text-[14.5px]" data-plan>
                {[
                  ["Network", `${CHAIN.name} · chain id ${CHAIN.id}`],
                  ["Contract", `${plan.functionName === "launchAndBuy" ? "Pons launch and buy" : "Pons launch factory"}`],
                  ["Pair", d.pair],
                  ["Launch fee (Pons)", `${eth(plan.launchFee)} ETH`],
                  ...(plan.firstBuyWei > 0n ? [["First buy", `${eth(plan.firstBuyWei)} ETH`]] : []),
                  ["Sent with the transaction", `${eth(plan.value)} ETH`],
                  ["Network fee (estimate, max)", plan.networkFee > 0n ? `${eth(plan.networkFee, 8)} ETH` : "—"],
                  ["Your ETH", `${eth(plan.balance)} ETH`],
                  ["Creator fee", `${Number(d.feePct || 0)}% to ${shortAddress(address ?? "", 6, 4)}`],
                  ["Website on chain", BRAND.domain],
                ].map(([k, v]) => (
                  <div key={k} className="plan-row">
                    <span className="text-muted">{k}</span>
                    <span className="min-w-0 text-right">{v}</span>
                  </div>
                ))}
                <div className="mt-1 rounded-2xl bg-tile px-4 py-3">
                  <span className="text-muted">Contract address</span>
                  <a href={explorerAddress(plan.to)} target="_blank" rel="noreferrer" className="mt-0.5 block break-all text-[13.5px] underline-offset-2 hover:underline" data-plan-contract>
                    {plan.to}
                  </a>
                </div>
                <ul className="mt-1 grid gap-1 text-[13px]" data-checks>
                  {plan.checks.map((c) => (
                    <li key={c.label} className={`flex items-start gap-2 ${c.ok ? "text-ink-soft" : "text-danger"}`}>
                      {c.ok ? <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-ok" /> : <AlertIcon className="mt-0.5 size-3.5 shrink-0" />}
                      <span>
                        <span className="font-medium">{c.label}:</span> {c.detail}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12.5px] leading-relaxed text-muted">
                  Early buyers pay a snipe tax that starts at {plan.snipeTaxStartBps / 100}% and fades to zero over {plan.snipeTaxSeconds} seconds. Name, ticker,
                  picture, lore and links are written into the token and cannot be edited after launch.
                </p>
              </div>
            ) : address && onRobinhoodChain ? (
              <p className="text-[14px] text-muted">Reading live Pons terms…</p>
            ) : null}

            {phase.kind === "pending" ? (
              <div className="notice" data-pending>
                Sent. Waiting for Robinhood Chain to confirm…{" "}
                <a className="underline" href={`${CHAIN.explorer}/tx/${phase.hash}`} target="_blank" rel="noreferrer" data-pending-hash>
                  {shortAddress(phase.hash, 10, 8)}
                </a>
              </div>
            ) : null}
            {phase.kind === "failed" ? (
              <div className="notice !bg-danger-tint !text-danger" role="alert" data-launch-error>
                {phase.message}
                {phase.hash ? (
                  <>
                    {" "}
                    <a className="underline" href={`${CHAIN.explorer}/tx/${phase.hash}`} target="_blank" rel="noreferrer">
                      View transaction
                    </a>
                  </>
                ) : null}
              </div>
            ) : plan && !plan.ready && plan.error ? (
              <div className="notice !bg-danger-tint !text-danger" role="alert">
                {plan.error}
              </div>
            ) : null}

            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <button type="button" className="btn-outline h-12" disabled={busy} onClick={() => setStep(1)}>
                Edit
              </button>
              <button
                type="button"
                className="btn-primary h-12"
                disabled={busy || switching || (address !== null && onRobinhoodChain && plan !== null && !plan.ready)}
                onClick={() => void launch()}
                data-launch
              >
                {!address
                  ? "Connect wallet to launch"
                  : !onRobinhoodChain
                    ? switching
                      ? "Confirm in wallet…"
                      : `Switch to ${CHAIN.name}`
                    : phase.kind === "preparing"
                      ? "Checking Pons…"
                      : phase.kind === "signing"
                        ? "Confirm in your wallet…"
                        : phase.kind === "pending"
                          ? "Launching…"
                          : plan
                            ? `Launch token · ${eth(plan.value)} ETH`
                            : "Launch token"}
                <ArrowRight className="size-4" />
              </button>
            </div>
            {plan && !busy ? (
              <button type="button" className="justify-self-start text-[13px] text-ink-soft underline-offset-2 hover:underline" onClick={() => void prepare()}>
                Refresh terms
              </button>
            ) : null}
            <p className="break-all text-[12px] text-muted">
              Share this draft: <span className="select-all">{link}</span>
            </p>
          </>
        ) : null}
      </div>
      </div>
    </section>
  );
}
