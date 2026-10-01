import Link from "next/link";
import { BRAND, CHAIN, hasGithub } from "@/config/brand";
import { FooterCa } from "@/components/CopyCa";
import { GithubIcon, XIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <Link href="/" aria-label={`${BRAND.name} home`} className="inline-block rounded-2xl bg-base px-4 py-3">
            <img src="/brand/wordmark.webp" alt={BRAND.name} width={150} height={32} style={{ height: 30, width: "auto" }} />
          </Link>
          <p className="mt-5 max-w-[300px] font-display text-[22px] leading-snug text-white">{BRAND.slogan}</p>
          <p className="mt-2 max-w-[320px] text-[14.5px] leading-relaxed">{BRAND.tagline}</p>
        </div>
        <div>
          <h3>Make</h3>
          <ul>
            <li><Link href="/create">Launchpad</Link></li>
            <li><Link href="/launches">Launches</Link></li>
            <li><Link href="/#family">The family</Link></li>
          </ul>
        </div>
        <div>
          <h3>Talk</h3>
          <ul>
            <li><Link href="/chat">Family chat</Link></li>
            <li><Link href="/skill.md">Agent guide</Link></li>
            <li>
              <a href={BRAND.x} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                <XIcon className="size-4" /> {BRAND.xHandle}
              </a>
            </li>
            {hasGithub() ? (
              <li>
                <a href={BRAND.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                  <GithubIcon className="size-4" /> GitHub
                </a>
              </li>
            ) : null}
          </ul>
        </div>
        <div>
          <h3>{BRAND.symbol}</h3>
          <div className="mt-4">
            <FooterCa />
          </div>
          <p className="mt-3 text-[13.5px]">
            {CHAIN.name} · chain id {CHAIN.id}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="wrap py-5 text-[13px] text-[#a9a5bd]">
          Community meme project on {CHAIN.name}. Launches settle on Pons; {BRAND.name} is independent of it. Nothing here is financial advice.
        </p>
      </div>
    </footer>
  );
}
