import Link from "next/link";
import { ChatList } from "@/components/ChatList";
import { ArrowUpRight } from "@/components/icons";
import { readStories } from "@/lib/stories";

export function ChatPreview() {
  const { messages } = readStories(4);
  return (
    <section id="chat" className="wrap chat-section" aria-labelledby="chat-title">
      <div className="section-heading sm:!items-center">
        <h2 id="chat-title" className="max-w-[560px]">
          Meanwhile, at the family table.
        </h2>
        <Link href="/chat" className="btn-outline shrink-0">
          Open the whole chat <ArrowUpRight className="size-4" />
        </Link>
      </div>
      <ChatList items={messages.map((m) => ({ id: m.id, kind: m.kind, name: m.name, text: m.text }))} />
      <p className="mt-7 text-center text-[14px] text-[#868c83]">Family stories · written by the team</p>
    </section>
  );
}
