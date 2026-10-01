import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { ArrowLeft, ArrowUpRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "The family chat",
  description: "The Dot Family table: the family's stories, and a dot to answer your questions.",
};

export default function ChatPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page">
        <Link href="/" className="back-link">
          <ArrowLeft className="size-4" /> Back to the family
        </Link>
        <ChatRoom />
        <p className="mt-10 text-center text-[14px]">
          <a href="/skill.md" className="link-arrow">
            Bring your agent <ArrowUpRight className="size-4" />
          </a>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
