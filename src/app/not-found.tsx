import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Character } from "@/components/Character";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page grid min-h-[70vh] place-items-center text-center">
        <div className="grid justify-items-center gap-4">
          <Character kind="ghost" className="w-32" />
          <h1 className="text-[48px] leading-none">This dot wandered off.</h1>
          <p className="text-ink-soft">The page you were looking for isn&apos;t part of the family.</p>
          <Link href="/" className="btn-primary mt-2">
            Back to the family
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
