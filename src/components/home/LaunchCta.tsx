import Link from "next/link";
import { Character } from "@/components/Character";
import { ArrowDown, ArrowUpRight, CodeIcon, PlusIcon } from "@/components/icons";

export function LaunchCta() {
  return (
    <section className="launch-section" aria-labelledby="launch-title">
      <div className="wrap launch-grid">
        <div className="pt-10 lg:pl-[5%]">
          <h2 id="launch-title">
            Your turn.
            <br />
            <span>Start a little lore.</span>
          </h2>
          <p className="mt-5 max-w-[300px] text-[16px] leading-relaxed text-[#5d5870]">One character. One story. One token on Pons.</p>
          <div className="mt-8 flex flex-col items-start gap-4">
            <Link href="/create" className="btn-primary">
              Create a token <PlusIcon className="size-4" />
            </Link>
            <Link href="/launches" className="link-arrow">
              See launches <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="relative">
          <Character kind="spark" className="absolute -top-14 right-[4%] z-10 w-24 rotate-12 max-sm:w-16" />
          <div className="machine">
            <span className="absolute -top-3 left-[38%] h-6 w-20 rotate-2 bg-[#f6d967]/80" aria-hidden="true" />
            <div className="flex items-center justify-between border-b border-dashed border-[#d9d4c1] pb-3 text-[13px] uppercase tracking-[0.06em] text-[#5b6358]">
              Lore → token <span className="size-1.5 rounded-full bg-ink" />
            </div>
            <div className="machine-row mt-3 bg-sage">
              <Character kind="ghost" className="w-11 shrink-0" />
              <span className="text-[14px]">Your character</span>
              <span className="ml-auto text-[#8c9488]">···</span>
            </div>
            <div className="grid place-items-center py-2 text-[#8c9488]">
              <ArrowDown className="size-4" />
            </div>
            <div className="machine-row bg-[#ebe6f6]">
              <span className="coin !size-11 shrink-0 !text-[16px] !shadow-[3px_3px_0_#d8ac2f]">·</span>
              <span className="min-w-0">
                <span className="block text-[14px]">Your token</span>
                <span className="block text-[14px] text-[#5b5670]">$SOMETHING</span>
              </span>
              <span className="ml-auto rounded-md border border-[#cdc6e0] px-2 py-1 text-[12px]">PONS</span>
            </div>
            <svg viewBox="0 0 300 70" className="mt-4 w-full" aria-hidden="true">
              <path d="M10 6V60H290" fill="none" stroke="#d9d4c1" />
              <path d="M14 56C80 54 120 50 170 36S240 18 288 20" fill="none" stroke="#8a77c4" strokeWidth="2.5" />
              <circle cx="170" cy="36" r="4" fill="#ae9fec" />
              <circle cx="288" cy="20" r="4" fill="#f6d967" />
            </svg>
            <div className="mt-1 flex justify-between text-[13px] text-[#5b6358]">
              <span>Bonding curve</span>
              <span className="inline-flex items-center gap-1">Pool after graduation <ArrowUpRight className="size-3.5" /></span>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-[13px] text-[#6a6f63]">
              <CodeIcon className="size-4" /> Pons · Robinhood Chain
            </p>
          </div>
        </div>
      </div>
      <svg className="pointer-events-none absolute bottom-24 left-[12%] z-[1] hidden h-[160px] w-[34%] lg:block" viewBox="0 0 400 160" aria-hidden="true">
        <path d="M10 150C80 140 120 60 200 70S320 40 395 5" fill="none" stroke="#9c8fbf" strokeWidth="2.5" strokeDasharray="4 9" strokeLinecap="round" />
      </svg>
      <Character kind="bloom" mood="joy" className="absolute -bottom-6 left-[7%] z-[2] w-40 max-sm:w-24" />
      <Character kind="ghost" className="absolute -bottom-10 -right-6 z-[2] w-44 -rotate-6 max-sm:w-24" />
    </section>
  );
}
