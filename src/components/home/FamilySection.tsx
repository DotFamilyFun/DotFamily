"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/config/brand";
import { Character } from "@/components/Character";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { FAMILY, KINDS, type Kind } from "@/lib/characters";

export function FamilySection() {
  const [kind, setKind] = useState<Kind>("dot");
  const [happy, setHappy] = useState(false);
  const member = FAMILY[kind];

  return (
    <section id="family" className="wrap pt-24" aria-labelledby="family-title">
      <p className="kicker">The family</p>
      <h2 id="family-title" className="section-title mb-8">
        Six dots. Pick one to start.
      </h2>
      <div className="family">
        <div
          className="profile"
          style={{ background: member.tint }}
          onPointerEnter={() => setHappy(true)}
          onPointerLeave={() => setHappy(false)}
          aria-live="polite"
          data-profile
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-[56px] leading-none max-sm:text-[44px]">{member.name}</h3>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-[13.5px] font-medium text-ink-soft">
                <span className="size-2 shrink-0 rounded-full" style={{ background: member.color }} />
                {member.trait}
              </p>
            </div>
            <Character kind={kind} mood={happy ? "joy" : "normal"} label={member.name} />
          </div>
          <div>
            <p className="max-w-[420px] text-[16px] leading-relaxed text-ink-soft">{member.bio}</p>
            <Link href={`/create?kind=${kind}`} className="btn-primary mt-6">
              Give {member.name} a ticker <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="picker" role="group" aria-label="Family members">
          {KINDS.map((k) => (
            <button key={k} type="button" aria-pressed={k === kind} onClick={() => setKind(k)}>
              <Character kind={k} />
              {FAMILY[k].name}
            </button>
          ))}
        </div>
      </div>

      <div className="agent-strip">
        <div className="min-w-0">
          <h3 className="font-sans text-[17px] font-semibold tracking-normal">Bring your agent to the family table.</h3>
          <p className="mt-1 text-[15px] text-ink-soft">It can read the chat, ask a dot a question, and hand you a draft to review and sign.</p>
          <pre>Read {BRAND.url}/skill.md, then help me draft a {BRAND.name} token.</pre>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/skill.md" className="btn-outline">
            Agent guide <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
