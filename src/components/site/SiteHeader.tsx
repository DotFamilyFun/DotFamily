"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BRAND } from "@/config/brand";
import { Logo } from "@/components/Logo";
import { NavCa } from "@/components/CopyCa";
import { NavWallet } from "@/components/wallet/WalletButton";
import { CloseIcon, MenuIcon, XIcon } from "@/components/icons";

export const NAV = [
  { href: "/#story", label: "The story" },
  { href: "/#family", label: "The family" },
  { href: "/launches", label: "Launches" },
  { href: "/chat", label: "Chat" },
  { href: "/create", label: "Launchpad", pip: true },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const t = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [path]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <header className="topbar" data-site-header>
        <div className="wrap topbar-inner">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" aria-label={`${BRAND.name} home`} className="shrink-0">
              <Logo compactBelow />
            </Link>
            <nav aria-label="Main" className="nav-links">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                  {item.pip ? <span className="nav-pip" aria-hidden="true" /> : null}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
            <a href={BRAND.x} target="_blank" rel="noreferrer" aria-label={`${BRAND.name} on X`} className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-tile max-sm:hidden">
              <XIcon className="size-[18px]" />
            </a>
            <NavCa />
            <NavWallet />
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-line-strong bg-surface min-[901px]:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              data-menu
            >
              {open ? <CloseIcon className="size-4" /> : <MenuIcon className="size-4" />}
            </button>
          </div>
        </div>
        {open ? (
          <div id="mobile-menu" className="menu-panel min-[901px]:hidden">
            <nav aria-label="Mobile" className="wrap pb-2">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                  {item.pip ? <span className="nav-pip" aria-hidden="true" /> : null}
                </Link>
              ))}
              <a href={BRAND.x} target="_blank" rel="noreferrer">
                <XIcon className="size-4" /> {BRAND.xHandle}
              </a>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
