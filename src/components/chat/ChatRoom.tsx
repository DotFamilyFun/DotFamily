"use client";

import { useCallback, useEffect, useState } from "react";
import { Character } from "@/components/Character";
import { ChatList, type ChatItem } from "@/components/ChatList";
import { SendIcon } from "@/components/icons";
import { useLocalStore } from "@/components/wallet/useLocalStore";
import { FAMILY, KINDS, type Kind } from "@/lib/characters";
import type { ChatRow } from "@/lib/stories";

type Asked = { id: string; kind: Kind; question: string; answer: string; at: number };

const stamp = (ms: number) => `${new Date(ms).toISOString().slice(0, 16).replace("T", " ")} UTC`;

export function ChatRoom() {
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [next, setNext] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const [configured, setConfigured] = useState<boolean | null>(null);
  const [kind, setKind] = useState<Kind>("dot");
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");
  const [asked, saveAsked] = useLocalStore<Asked[]>("dotfamily.asked", []);

  const load = useCallback(async (before?: number) => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/chat?limit=20${before ? `&before=${before}` : ""}`);
      if (!r.ok) throw new Error("The chat could not load. Try again.");
      const body = (await r.json()) as { messages: ChatRow[]; next: number | null };
      setRows((cur) => (before ? [...cur, ...body.messages] : body.messages));
      setNext(body.next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Deferred so the loading state is not set synchronously inside the effect.
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [load, reload]);

  useEffect(() => {
    fetch("/api/ask")
      .then((r) => r.json())
      .then((b: { configured?: boolean }) => setConfigured(Boolean(b.configured)))
      .catch(() => setConfigured(false));
  }, []);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    setAskError("");
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, question: q }) });
      const body = (await r.json()) as { text?: string; error?: string; message?: string };
      if (r.status === 503 && body.error === "not_configured") {
        setConfigured(false);
        return;
      }
      if (!r.ok || !body.text) throw new Error(body.message ?? "The family could not answer right now.");
      saveAsked([{ id: `${Date.now()}`, kind, question: q, answer: body.text, at: Date.now() }, ...asked].slice(0, 20));
      setQuestion("");
    } catch (err) {
      setAskError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAsking(false);
    }
  }

  const mine: ChatItem[] = asked.flatMap((a) => [
    { id: `${a.id}-a`, kind: a.kind, name: FAMILY[a.kind].name, text: a.answer, origin: "answer · this browser", time: stamp(a.at) },
    { id: `${a.id}-q`, kind: "ghost" as Kind, name: "You", text: a.question, origin: "question · this browser", time: stamp(a.at), mine: true },
  ]);

  const stories: ChatItem[] = rows.map((m) => ({
    id: m.id,
    kind: m.kind,
    name: m.name,
    text: m.text,
    reply_to: m.reply_to,
    origin: `story · #${m.id}`,
  }));

  return (
    <section className="mt-6" aria-labelledby="chat-title">
      <p className="kicker">Family chat</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 id="chat-title" className="text-[52px] leading-[1.02] max-sm:text-[40px]">
          The family is talking.
        </h1>
        <button type="button" className="btn-outline shrink-0" disabled={loading} onClick={() => setReload((v) => v + 1)}>
          Refresh
        </button>
      </div>
      <div className="chat-layout">
        <aside className="chat-aside">
        <form onSubmit={ask} className="sheet grid gap-4" data-ask>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-sans text-[17px] tracking-normal">Ask a dot</h2>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Who answers">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  aria-label={FAMILY[k].name}
                  title={FAMILY[k].name}
                  onClick={() => setKind(k)}
                  className={`grid size-10 place-items-center rounded-xl border p-1 transition-colors ${kind === k ? "border-pine bg-sage" : "border-transparent hover:bg-chip"}`}
                >
                  <Character kind={k} shadow={false} className="w-full" />
                </button>
              ))}
            </div>
          </div>
          {configured === false ? (
            <p className="notice" data-ask-off>
              {FAMILY[kind].name} can&apos;t answer live on this site yet: the family&apos;s live voice hasn&apos;t been switched on. The stories below are always here.
            </p>
          ) : null}
          <div className="flex gap-2">
            <label className="field min-w-0 flex-1">
              <span className="sr-only">Your question</span>
              <input
                value={question}
                maxLength={400}
                placeholder={`Ask ${FAMILY[kind].name} anything about the family…`}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={configured === false}
              />
            </label>
            <button type="submit" className="btn-primary !h-[46px] shrink-0 !px-4" disabled={!question.trim() || asking || configured === false} aria-label="Send">
              {asking ? "…" : <SendIcon className="size-4" />}
            </button>
          </div>
          {askError ? <p className="text-[13.5px] text-danger">{askError}</p> : null}
          <p className="text-[12.5px] text-muted">Answers are written by an AI model in character. Not advice. Your questions stay in this browser.</p>
        </form>
          <div className="card p-5">
            <h2 className="font-sans text-[15px] font-semibold tracking-normal">At the table</h2>
            <ul className="mt-3 grid gap-2.5">
              {KINDS.map((k) => (
                <li key={k} className="flex items-center gap-3 text-[14px]">
                  <Character kind={k} shadow={false} className="w-8 shrink-0" />
                  <span className="min-w-0">
                    <span className="font-semibold">{FAMILY[k].name}</span>
                    <span className="block truncate text-[12.5px] text-muted">{FAMILY[k].trait}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="min-w-0">
          {mine.length ? (
            <div className="mb-10">
              <p className="mb-4 text-[14px] text-muted">Your questions · this browser only</p>
              <ChatList items={mine} detailed />
            </div>
          ) : null}
          <p className="mb-4 text-[14px] text-muted">Newest first · Family stories, written by the team</p>
          <ChatList items={stories} detailed />
          <div className="mt-8 grid justify-items-center gap-3" aria-live="polite">
            {error ? (
              <>
                <p role="alert">{error}</p>
                <button type="button" className="btn-outline" onClick={() => void load()}>
                  Try again
                </button>
              </>
            ) : null}
            {loading ? <p className="text-[14px] text-muted">Loading the family…</p> : null}
            {next && !error ? (
              <button type="button" className="btn-outline" disabled={loading} onClick={() => void load(next)}>
                Older messages
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
