import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LaunchBoard } from "@/components/launches/LaunchBoard";

export const metadata: Metadata = {
  title: "Launches",
  description: "Dot Family launches on Robinhood Chain, and the newest launches on Pons, read live.",
};

export default function LaunchesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page">
        <LaunchBoard />
      </main>
      <SiteFooter />
    </>
  );
}
