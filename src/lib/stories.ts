import { FAMILY, type Kind } from "@/lib/characters";
import { STORIES, STORY_EPOCH } from "@/lib/content";

export type ChatRow = {
  id: number;
  kind: Kind;
  name: string;
  text: string;
  reply_to: number | null;
  /** 1 for the team-written opening story. Every row on this site is one. */
  scripted: 1;
  created_at: number;
};

/** Newest first, `limit` rows older than `before` (a message id). */
export function readStories(limit: number, before?: number) {
  const ordered = [...STORIES].sort((a, b) => b.id - a.id);
  const pool = before ? ordered.filter((s) => s.id < before) : ordered;
  const page = pool.slice(0, limit);
  const messages: ChatRow[] = page.map((s) => ({
    id: s.id,
    kind: s.kind,
    name: FAMILY[s.kind].name,
    text: s.text,
    reply_to: s.reply_to,
    scripted: 1,
    created_at: STORY_EPOCH + Math.round(s.at * 3_600_000),
  }));
  const next = pool.length > limit ? page[page.length - 1].id : null;
  return { messages, next };
}
