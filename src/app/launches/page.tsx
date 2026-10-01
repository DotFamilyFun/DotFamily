import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Character } from "@/components/Character";
import { LaunchBoard } from "@/components/launches/LaunchBoard";
import { ArrowLeft } from "@/components/icons";

export const metadata: Metadata = {
  title: "Launches",
  description: "Dot Family launches on Robinhood Chain, and the newest launches on Pons, read live.",
};

export default function LaunchesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page">
        <Link href="/" className="back-link">
          <ArrowLeft className="size-4" /> Back to the family
        </Link>
        <section className="mt-12 flex items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="kicker">Out in the wild</p>
            <h1 className="mt-3 text-[48px] leading-[1.05] max-sm:text-[40px]">Every dot gets a launch.</h1>
            <p className="mt-4 text-[16px] text-[#5f665c]">Made here, settled on Robinhood Chain.</p>
          </div>
          <Character kind="spark" mood="joy" className="w-32 shrink-0 rotate-6 max-sm:w-20" />
        </section>
        <LaunchBoard />
      </main>
      <SiteFooter />
    </>
  );
}
