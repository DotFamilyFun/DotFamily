import Link from "next/link";
import { Character } from "@/components/Character";
import { ArrowDown, ArrowUpRight, CodeIcon, PlusIcon } from "@/components/icons";

export function LaunchCta() {
  return (
    <section className="wrap pt-24" aria-labelledby="launch-title">
      <div className="band">
        <div className="relative z-[1]">
          <p className="kicker kicker-light">Launchpad</p>
          <h2 id="launch-title" className="mt-4">
            Your turn.
            <br />
            Start a little lore.
          </h2>
          <p className="mt-5 max-w-[380px] text-[16px] leading-relaxed text-[#d9d6e6]">
            One character, one story, one real token on Pons. Your wallet signs it; the review shows every fee first.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/create" className="btn-primary">
              Create a token <PlusIcon className="size-4" />
            </Link>
            <Link href="/launches" className="link-arrow !text-white">
              See launches <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <Character kind="bloom" mood="joy" className="mt-10 w-24 max-sm:hidden" />
        </div>
        <div className="machine">
          <div className="flex items-center justify-between border-b border-dashed border-line-strong pb-3 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-muted">
            Lore → token <span className="size-2 rounded-full bg-brand" />
          </div>
          <div className="machine-row mt-3 bg-tile">
            <Character kind="ghost" className="w-11 shrink-0" />
            <span className="text-[14px] font-medium">Your character</span>
          </div>
          <div className="grid place-items-center py-2 text-muted">
            <ArrowDown className="size-4" />
          </div>
          <div className="machine-row bg-mint">
            <span className="coin !size-11 shrink-0 !text-[16px] !shadow-[3px_3px_0_#d8ac2f]">$</span>
            <span className="min-w-0">
              <span className="block text-[14px] font-medium">Your token</span>
              <span className="block text-[13.5px] text-ink-soft">$SOMETHING</span>
            </span>
            <span className="ml-auto rounded-full border border-mint-line bg-surface px-2.5 py-1 text-[12px] font-semibold">PONS V2</span>
          </div>
          <svg viewBox="0 0 300 70" className="mt-4 w-full" aria-hidden="true">
            <path d="M10 6V60H290" fill="none" stroke="#c3b8e0" />
            <path d="M14 56C80 54 120 50 170 36S240 18 288 20" fill="none" stroke="#3f5e49" strokeWidth="2.5" />
            <circle cx="170" cy="36" r="4" fill="#8fd0a5" />
            <circle cx="288" cy="20" r="4" fill="#f2c94c" />
          </svg>
          <div className="mt-1 flex justify-between text-[13px] text-muted">
            <span>Bonding curve</span>
            <span>Pool after graduation</span>
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-[13px] text-muted">
            <CodeIcon className="size-4" /> Pons V2 · Robinhood Chain
          </p>
        </div>
      </div>
    </section>
  );
}
