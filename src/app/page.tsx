import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { LoreSection } from "@/components/home/LoreSection";
import { FamilySection } from "@/components/home/FamilySection";
import { ArcadeSection } from "@/components/home/ArcadeSection";
import { ChatPreview } from "@/components/home/ChatPreview";
import { LaunchCta } from "@/components/home/LaunchCta";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <LoreSection />
        <FamilySection />
        <LaunchCta />
        <ChatPreview />
        <ArcadeSection />
      </main>
      <SiteFooter />
    </>
  );
}
