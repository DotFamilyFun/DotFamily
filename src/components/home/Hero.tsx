import Link from "next/link";
import { CHAIN } from "@/config/brand";
import { Character } from "@/components/Character";
import { HeroCa } from "@/components/CopyCa";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import type { Kind, Mood } from "@/lib/characters";

// A family photo, not a line-up: [left, top, width] as % of the panel.
const CLUSTER: { kind: Kind; mood?: Mood; at: [number, number, number]; rotate?: number }[] = [
  { kind: "dot", mood: "joy", at: [8, 40, 46] },
  { kind: "block", at: [56, 8, 30], rotate: 6 },
  { kind: "ghost", at: [12, 6, 22] },
  { kind: "spark", at: [60, 46, 32], rotate: -8 },
  { kind: "bloom", at: [40, 18, 20] },
  { kind: "bean", at: [52, 74, 22] },
];

export function Hero() {
  return (
    <section className="wrap hero2" aria-labelledby="hero-title" id="top">
      <div>
        <p className="kicker">Pons launchpad · {CHAIN.name}</p>
        <h1 id="hero-title" className="mt-5">
          Your dot.
          <br />
          <em>Your family.</em>
        </h1>
        <p className="mt-6 max-w-[460px] text-[19px] leading-relaxed text-ink-soft">Join the dot family. Create with lore. Your token.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/create" className="btn-primary">
            Start your dot <ArrowRight className="size-4" />
          </Link>
          <Link href="/launches" className="btn-outline !h-12 !px-5">
            See launches <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <HeroCa />
      </div>
      <div className="cluster" aria-hidden="true">
        {CLUSTER.map((m) => (
          <span key={m.kind} className="member" style={{ left: `${m.at[0]}%`, top: `${m.at[1]}%`, width: `${m.at[2]}%`, rotate: m.rotate ? `${m.rotate}deg` : undefined }}>
            <Character kind={m.kind} mood={m.mood} className="w-full" />
          </span>
        ))}
        <span className="cluster-tag" style={{ right: "6%", bottom: "8%" }}>
          lore → token
        </span>
        <span className="cluster-tag" style={{ left: "5%", top: "33%" }}>
          $PIP
        </span>
      </div>
    </section>
  );
}
