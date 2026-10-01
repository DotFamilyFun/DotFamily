import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CreateFlow } from "@/components/create/CreateFlow";
import { ArrowLeft } from "@/components/icons";

export const metadata: Metadata = {
  title: "The launchpad",
  description: "Pick a character, write its lore and prepare a token on Pons, Robinhood Chain.",
};

export default function CreatePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page !max-w-[640px]">
        <Link href="/" className="back-link">
          <ArrowLeft className="size-4" /> Back to the family
        </Link>
        <CreateFlow />
      </main>
      <SiteFooter />
    </>
  );
}
