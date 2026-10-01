import Link from "next/link";
import { ChatList } from "@/components/ChatList";
import { ArrowUpRight } from "@/components/icons";
import { readStories } from "@/lib/stories";

export function ChatPreview() {
  const { messages } = readStories(4);
  return (
    <section id="chat" className="wrap chat-split pt-24" aria-labelledby="chat-title">
      <div className="md:sticky md:top-24">
        <p className="kicker">Family chat</p>
        <h2 id="chat-title" className="section-title">
          Meanwhile, at the family table.
        </h2>
        <p className="mt-4 max-w-[360px] text-[15.5px] leading-relaxed text-ink-soft">
          The opening family story, written by the team. Ask any dot a question in the full chat.
        </p>
        <Link href="/chat" className="btn-outline mt-6">
          Open the whole chat <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <ChatList items={[...messages].reverse().map((m) => ({ id: m.id, kind: m.kind, name: m.name, text: m.text }))} />
    </section>
  );
}
