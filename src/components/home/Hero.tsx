import Link from "next/link";
import { Character } from "@/components/Character";
import { HeroCa } from "@/components/CopyCa";
import { ArrowDown, ArrowUpRight } from "@/components/icons";
import type { Kind, Mood } from "@/lib/characters";

type Floater = { kind: Kind; mood?: Mood; d: [string, string, string]; m: [string, string, string]; mobileHidden?: boolean };

// Desktop and phone positions: [left, top, width].
const FLOATERS: Floater[] = [
  { kind: "bloom", d: ["65%", "13%", "72px"], m: ["5%", "15%", "58px"] },
  { kind: "block", d: ["82%", "18%", "118px"], m: ["74%", "17%", "74px"] },
  { kind: "spark", d: ["79%", "45%", "136px"], m: ["70%", "64%", "92px"] },
  { kind: "dot", mood: "joy", d: ["55%", "60%", "74px"], m: ["42%", "68%", "54px"] },
  { kind: "ghost", d: ["68%", "59%", "82px"], m: ["55%", "80%", "56px"] },
  { kind: "bean", d: ["91%", "64%", "70px"], m: ["80%", "84%", "58px"] },
];

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title" id="top">
      <svg className="hero-trail" viewBox="0 0 1000 600" preserveAspectRatio="none" style={{ inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
        <path d="M420 520 C470 430 520 440 565 470 C625 505 690 360 790 355" fill="none" stroke="#b9bdb0" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {FLOATERS.map((f) => (
        <span
          key={f.kind}
          className="floater hero-floater"
          style={
            {
              "--l": f.d[0],
              "--t": f.d[1],
              "--w": f.d[2],
              "--ml": f.m[0],
              "--mt": f.m[1],
              "--mw": f.m[2],
            } as React.CSSProperties
          }
        >
          <Character kind={f.kind} mood={f.mood} className="w-full" />
        </span>
      ))}
      <div className="hero-giant" aria-hidden="true">
        <Character kind="dot" mood="joy" className="w-full" />
      </div>
      <div className="hero-ground" aria-hidden="true" />

      <div className="hero-copy">
        <h1 id="hero-title">
          Your dot.
          <br />
          <span>Your family.</span>
        </h1>
        <p>Join the dot family. Create with lore. Your token.</p>
        <div className="hero-actions">
          <Link href="/create" className="btn-primary">
            Start your dot <ArrowUpRight className="size-4" />
          </Link>
          <a href="#lore" className="link-arrow">
            Read the lore <ArrowDown className="size-4" />
          </a>
        </div>
        <HeroCa />
      </div>
    </section>
  );
}
