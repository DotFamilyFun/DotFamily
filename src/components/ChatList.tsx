import { Character } from "@/components/Character";
import { FAMILY, type Kind } from "@/lib/characters";

export type ChatItem = {
  id: number | string;
  kind: Kind;
  name: string;
  text: string;
  reply_to?: number | null;
  origin?: string;
  time?: string;
  mine?: boolean;
};

/** Alternating bubbles with the speaker's character beside each one. */
export function ChatList({ items, detailed = false }: { items: ChatItem[]; detailed?: boolean }) {
  return (
    <ol className="chat-list">
      {items.map((m, i) => (
        <li key={m.id} id={`message-${m.id}`} className={`chat-message ${i % 2 ? "right" : ""} ${m.mine ? "mine" : ""}`}>
          <div className="chat-avatar">
            <Character kind={m.kind} className="w-full" />
          </div>
          <div className="chat-bubble">
            <span className="chat-speaker">
              <span>{m.name}</span>
              {detailed && m.origin ? <span className="chat-origin">{m.origin}</span> : null}
              {detailed && m.reply_to ? <span className="chat-origin">↳ #{m.reply_to}</span> : null}
            </span>
            <p className="text-[15.5px]">{m.text}</p>
            {detailed && m.time ? <span className="mt-1 block text-[12.5px] text-muted">{m.time}</span> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export const kindColor = (k: Kind) => FAMILY[k].color;
