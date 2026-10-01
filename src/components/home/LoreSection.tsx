"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BRAND } from "@/config/brand";
import { Character } from "@/components/Character";
import { ArrowUpRight, CloseIcon } from "@/components/icons";
import { FAMILY, KINDS } from "@/lib/characters";
import { LORE, type LoreCard } from "@/lib/content";

function CardArt({ card }: { card: LoreCard }) {
  if (card.id === "first-dot") {
    return (
      <div className="lore-art">
        <svg viewBox="0 0 300 200" className="absolute inset-0 m-auto h-[70%] w-[90%]" aria-hidden="true">
          <ellipse cx="150" cy="100" rx="135" ry="62" fill="none" stroke="#cfc8e4" strokeWidth="1.5" transform="rotate(-12 150 100)" />
        </svg>
        <Character kind={card.kind} className="relative w-[46%] max-w-[170px]" />
        <span className="sticker" style={{ left: "10%", top: "22%", transform: "rotate(-14deg)" }}>pip</span>
        <span className="sticker" style={{ right: "6%", top: "44%", transform: "rotate(5deg)" }}>the first</span>
        <span className="sticker" style={{ left: "20%", bottom: "12%", transform: "rotate(-6deg)" }}>1</span>
      </div>
    );
  }
  if (card.id === "family") {
    return (
      <div className="lore-art !place-items-stretch">
        <p className="self-start text-[13px] text-[#6a6f63]">{BRAND.xHandle}</p>
        <div className="flex items-center justify-between gap-2 self-center px-1">
          {KINDS.map((k, i) => (
            <span
              key={k}
              className="block size-[18px] shrink-0 rounded-full"
              style={{ background: FAMILY[k].color, transform: `translateY(${i % 2 ? 8 : -4}px)` }}
            />
          ))}
        </div>
        <p className="self-end text-right text-[13px] text-[#6a6f63]">1 Oct 2026</p>
      </div>
    );
  }
  return (
    <div className="lore-art">
      <svg viewBox="0 0 200 200" className="absolute inset-0 m-auto h-[85%] w-[85%]" aria-hidden="true">
        <circle cx="100" cy="100" r="92" fill="none" stroke="#d2dccb" strokeWidth="1" />
        <circle cx="100" cy="100" r="66" fill="none" stroke="#d2dccb" strokeWidth="1" />
      </svg>
      <span className="coin relative">$</span>
      <span className="sticker font-medium" style={{ right: "4%", top: "8%", transform: "rotate(6deg)" }}>$YOURDOT</span>
      <span className="sticker" style={{ left: "4%", bottom: "12%", transform: "rotate(-8deg)" }}>lore → token</span>
    </div>
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
          <p key={p} className="mt-4 leading-relaxed text-[#4a5548]">
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

export function LoreSection() {
  const [open, setOpen] = useState<LoreCard | null>(null);
  return (
    <section id="lore" className="wrap lore-section" aria-labelledby="lore-title">
      <div className="section-heading">
        <h2 id="lore-title">Connect the dots.</h2>
      </div>
      <div className="lore-grid">
        {LORE.map((card) => (
          <button key={card.id} type="button" className="lore-card" onClick={() => setOpen(card)} aria-haspopup="dialog" data-lore={card.id}>
            {card.id === "first-dot" ? <span className="lore-tape" aria-hidden="true" /> : null}
            <span className="flex items-start justify-between">
              <span className="lore-tag">{card.tag}</span>
              <ArrowUpRight className="size-4 text-[#5b6358]" />
            </span>
            <CardArt card={card} />
            <h3>{card.title}</h3>
          </button>
        ))}
      </div>
      {open ? <LoreDialog card={open} onClose={() => setOpen(null)} /> : null}
    </section>
  );
}
