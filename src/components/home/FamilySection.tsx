"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/config/brand";
import { Character } from "@/components/Character";
import { ArrowUpRight } from "@/components/icons";
import { FAMILY, KINDS, type Kind } from "@/lib/characters";

export function FamilySection() {
  const [kind, setKind] = useState<Kind>("dot");
  const [happy, setHappy] = useState(false);
  const member = FAMILY[kind];

  return (
    <section id="family" className="wrap family-section" aria-labelledby="family-title">
      <div className="section-heading">
        <h2 id="family-title">Meet the family.</h2>
      </div>
      <div className="crew-layout">
        <div className="crew-picker" role="group" aria-label="Family members">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={k === kind}
              onClick={() => setKind(k)}
              className="crew-option"
              style={{ "--sel-bg": FAMILY[k].tint, "--sel-line": FAMILY[k].color } as React.CSSProperties}
            >
              <Character kind={k} />
              {FAMILY[k].name}
            </button>
          ))}
        </div>
        <div className="agent-profile" onPointerEnter={() => setHappy(true)} onPointerLeave={() => setHappy(false)} aria-live="polite">
          <Character kind={kind} mood={happy ? "joy" : "normal"} label={member.name} />
          <div className="min-w-0">
            <h3 className="text-[48px] leading-none">{member.name}.</h3>
            <p className="mt-3 flex items-center gap-2 text-[14px] text-[#5b6358] max-sm:justify-center">
              <span className="size-2 shrink-0 rounded-full" style={{ background: member.color }} />
              {member.trait}
            </p>
            <p className="mt-3 max-w-[340px] text-[15px] leading-relaxed text-[#4a5548]">{member.bio}</p>
            <Link href={`/create?kind=${kind}`} className="link-arrow mt-5 !text-[15px]">
              Give {member.name} a ticker <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="agent-card">
        <h3 className="font-sans text-[17px] tracking-normal">Bring your agent to the family table.</h3>
        <p className="mt-2 text-[15px] text-[#4f5a4e]">Read the family chat, ask a dot a question, and hand your human a ready-made draft.</p>
        <pre>Read {BRAND.url}/skill.md, then help me draft a {BRAND.name} token.</pre>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <a href="/skill.md" className="btn-outline">
            Get the agent guide <ArrowUpRight className="size-4" />
          </a>
          <Link href="/chat" className="link-arrow">
            Open the chat <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
