"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Character } from "@/components/Character";
import { ArrowUpRight, CloseIcon } from "@/components/icons";
import { KINDS } from "@/lib/characters";
import { LORE, type LoreCard } from "@/lib/content";

function CardArt({ card }: { card: LoreCard }) {
  if (card.id === "first-dot") return <Character kind="dot" className="w-[110px]" />;
  if (card.id === "family") {
    return (
      <span className="flex items-end gap-1.5">
        {KINDS.map((k, i) => (
          <Character key={k} kind={k} className="w-[42px]" style={{ transform: `translateY(${i % 2 ? -10 : 4}px)` }} />
        ))}
      </span>
    );
  }
  return (
    <span className="relative">
      <span className="coin !size-24 !text-[32px]">$</span>
      <Character kind="spark" mood="joy" className="absolute -right-10 -top-6 w-14 rotate-12" />
    </span>
  );
}

function LoreDialog({ card, onClose }: { card: LoreCard; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="lore-dialog-title" className="fixed inset-0 z-[70] grid place-items-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 animate-fade cursor-default bg-ink/45" />
      <div className="relative w-full max-w-[520px] animate-pop rounded-[28px] bg-ivory p-6 shadow-[0_30px_70px_-30px_rgba(41,55,47,0.55)] sm:p-8">
        <Character kind={card.kind} mood="joy" className="absolute -top-10 right-6 w-20 rotate-6" />
        <p className="lore-tag">{card.tag}</p>
        <h2 id="lore-dialog-title" className="mt-3 text-[34px] leading-tight">
          {card.title}
        </h2>
        {card.detail.map((p) => (
          <p key={p} className="mt-4 leading-relaxed text-ink-soft">
            {p}
          </p>
        ))}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href={card.cta.href} onClick={onClose} className="btn-primary">
            {card.cta.label} <ArrowUpRight className="size-4" />
          </Link>
          <button type="button" onClick={onClose} className="btn-outline">
            <CloseIcon className="size-4" /> Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const TINTS = ["#fbf0c9", "#e8e2f7", "#dff0e4"];

export function LoreSection() {
  const [open, setOpen] = useState<LoreCard | null>(null);
  return (
    <section id="story" className="wrap pt-16" aria-labelledby="story-title">
      <span id="lore" />
      <div className="grid grid-cols-1 gap-4 pb-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
        <div>
          <p className="kicker">The story</p>
          <h2 id="story-title" className="section-title">
            From one dot
            <br />
            to a family.
          </h2>
        </div>
        <p className="max-w-[440px] text-[16px] leading-relaxed text-ink-soft md:justify-self-end">
          Every token here starts the same way the family did: a character, a little lore, and somebody willing to sign for it.
        </p>
      </div>
      <div className="steps">
        {LORE.map((card, i) => (
          <button key={card.id} type="button" className="step" onClick={() => setOpen(card)} aria-haspopup="dialog" data-lore={card.id}>
            <span className="step-num">0{i + 1}</span>
            <span className="step-art" style={{ background: TINTS[i] }}>
              <CardArt card={card} />
            </span>
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{card.tag}</span>
            <h3 className="text-[24px] leading-tight">{card.title}</h3>
            <span className="link-arrow">
              Read more <ArrowUpRight className="size-4" />
            </span>
          </button>
        ))}
      </div>
      {open ? <LoreDialog card={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
