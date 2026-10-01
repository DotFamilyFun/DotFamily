import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Logo } from "@/components/Logo";
import { NavCa } from "@/components/CopyCa";
import { NavWallet } from "@/components/wallet/WalletButton";
import { XIcon } from "@/components/icons";

export const NAV = [
  { href: "/#lore", label: "The lore" },
  { href: "/#family", label: "The family" },
  { href: "/launches", label: "Launches" },
  { href: "/create", label: "The launchpad", pip: true },
];

export function SiteHeader() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-50 focus:rounded-full focus:bg-pine focus:px-4 focus:py-2 focus:text-ivory">
        Skip to content
      </a>
      <header className="site-header" data-site-header>
        <Link href="/" aria-label={`${BRAND.name} home`} className="min-w-0 shrink-0">
          <Logo compactBelow />
        </Link>
        <nav aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
              {item.pip ? <span className="nav-pip" aria-hidden="true" /> : null}
            </Link>
          ))}
        </nav>
        <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <a href={BRAND.x} target="_blank" rel="noreferrer" aria-label={`${BRAND.name} on X`} className="grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-chip">
            <XIcon className="size-[18px]" />
          </a>
          <NavCa />
          <NavWallet />
        </div>
      </header>
    </>
  );
}
