import Link from "next/link";
import { BRAND, hasGithub } from "@/config/brand";
import { Logo } from "@/components/Logo";
import { FooterCa } from "@/components/CopyCa";
import { ArrowUpRight, GithubIcon, XIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link href="/" aria-label={`${BRAND.name} home`}>
        <Logo />
      </Link>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <FooterCa />
        <a href={BRAND.x} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink hover:underline">
          <XIcon className="size-4" /> {BRAND.xHandle}
        </a>
        {hasGithub() ? (
          <a href={BRAND.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink hover:underline">
            <GithubIcon className="size-4" /> GitHub
          </a>
        ) : null}
        <Link href="/skill.md" className="inline-flex items-center gap-1 text-ink hover:underline">
          Agent guide <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <p className="max-w-[300px] text-[13.5px] leading-snug sm:text-right">
        Community meme project on Robinhood Chain. Launches settle on Pons; {BRAND.name} is independent of it.
      </p>
    </footer>
  );
}
