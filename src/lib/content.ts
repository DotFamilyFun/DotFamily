import type { Kind } from "@/lib/characters";

/* Site copy that is data rather than layout: the lore cards, the family
   stories in the chat and the pairs a launch can use. All of it is written
   for Dot Family; none of it describes a real person or company. */

export type LoreCard = {
  id: string;
  tag: string;
  title: string;
  kind: Kind;
  detail: string[];
  cta: { label: string; href: string };
};

export const LORE: LoreCard[] = [
  {
    id: "first-dot",
    tag: "The first dot",
    title: "It started with one dot.",
    kind: "dot",
    detail: [
      "Before there was a family there was Pip: one yellow dot in the corner of an empty page, waiting to see if anyone else would show up.",
      "Pip gave itself a name, then a nickname, then three more nicknames, because a dot with no lore gets lonely fast.",
    ],
    cta: { label: "Meet Pip", href: "/#family" },
  },
  {
    id: "family",
    tag: "The family",
    title: "Then the dots kept coming.",
    kind: "bloom",
    detail: [
      "A grumpy square. A star with too many ideas. A ghost who mostly listens. A bean, a flower, and a chat that never sleeps.",
      "Nobody planned a family. The dots just kept pulling up chairs, and every new chair came with a story.",
    ],
    cta: { label: "Read the family chat", href: "/chat" },
  },
  {
    id: "your-turn",
    tag: "Your turn",
    title: "Your dot. Your family.",
    kind: "spark",
    detail: [
      "Pick a character, give it a name and a few lines of lore, and turn it into a token on Pons, the launchpad on Robinhood Chain.",
      "Your wallet reviews everything before anything is signed. Every launch is a community creation, made by the person who launches it.",
    ],
    cta: { label: "Start your dot", href: "/create" },
  },
];

export type Story = {
  id: number;
  kind: Kind;
  text: string;
  reply_to: number | null;
  /** Hours after the family chat opened; turned into a timestamp on read. */
  at: number;
};

/** The family chat, oldest first. Written by the team as an opening story. */
export const STORIES: Story[] = [
  { id: 1, kind: "dot", text: "Hello? Is this page empty or am I early?", reply_to: null, at: 0 },
  { id: 2, kind: "dot", text: "Early. Definitely early. I'll just wait here and look round.", reply_to: 1, at: 0.2 },
  { id: 3, kind: "block", text: "You're sitting in my corner.", reply_to: null, at: 1 },
  { id: 4, kind: "dot", text: "You have four corners!", reply_to: 3, at: 1.1 },
  { id: 5, kind: "block", text: "And I use all of them.", reply_to: 4, at: 1.2 },
  { id: 6, kind: "spark", text: "OK hear me out. What if the page had MORE dots", reply_to: null, at: 2 },
  { id: 7, kind: "spark", text: "and each dot had a story. and each story had a ticker", reply_to: 6, at: 2.05 },
  { id: 8, kind: "block", text: "No.", reply_to: 7, at: 2.1 },
  { id: 9, kind: "spark", text: "too late, I already named three of them", reply_to: 8, at: 2.15 },
  { id: 10, kind: "ghost", text: "…", reply_to: null, at: 3 },
  { id: 11, kind: "dot", text: "Oh! I didn't see you come in.", reply_to: 10, at: 3.1 },
  { id: 12, kind: "ghost", text: "Nobody does. I've been here since the first pixel.", reply_to: 11, at: 3.2 },
  { id: 13, kind: "bean", text: "did somebody say snacks", reply_to: null, at: 4 },
  { id: 14, kind: "block", text: "Nobody said snacks.", reply_to: 13, at: 4.1 },
  { id: 15, kind: "bean", text: "*winks* somebody was thinking it", reply_to: 14, at: 4.2 },
  { id: 16, kind: "bloom", text: "I've been watching this chat for an hour. The vibes are up only.", reply_to: null, at: 5 },
  { id: 17, kind: "block", text: "Vibes are not a chart.", reply_to: 16, at: 5.1 },
  { id: 18, kind: "bloom", text: "Everything is a chart if you stare hard enough.", reply_to: 17, at: 5.2 },
  { id: 19, kind: "dot", text: "So… are we a family now?", reply_to: null, at: 6 },
  { id: 20, kind: "ghost", text: "We were a family the moment the second dot arrived.", reply_to: 19, at: 6.1 },
  { id: 21, kind: "spark", text: "FAMILY MEETING. Agenda item one: everybody gets their own lore", reply_to: null, at: 7 },
  { id: 22, kind: "spark", text: "agenda item two: everybody's lore gets its own token", reply_to: 21, at: 7.05 },
  { id: 23, kind: "block", text: "Who is paying for this meeting?", reply_to: 22, at: 7.1 },
  { id: 24, kind: "ghost", text: "Nobody. Launches go through Pons and the person launching signs it in their own wallet.", reply_to: 23, at: 7.2 },
  { id: 25, kind: "block", text: "Fine. I'll allow one token. Maybe two.", reply_to: 24, at: 7.3 },
  { id: 26, kind: "bean", text: "I want mine to be called $BEAN and it should smell like toast", reply_to: null, at: 8 },
  { id: 27, kind: "bloom", text: "Tokens don't smell, Bean.", reply_to: 26, at: 8.1 },
  { id: 28, kind: "bean", text: "not with that attitude", reply_to: 27, at: 8.2 },
  { id: 29, kind: "dot", text: "What do I write for my story? I'm just… round.", reply_to: null, at: 9 },
  { id: 30, kind: "ghost", text: "Write the round part. That's the part people remember.", reply_to: 29, at: 9.1 },
  { id: 31, kind: "spark", text: "also the part where you got here first. that's lore", reply_to: 29, at: 9.15 },
  { id: 32, kind: "bloom", text: "Reminder: a draft is not a token. Nothing happens until a wallet signs.", reply_to: null, at: 10 },
  { id: 33, kind: "block", text: "Finally, someone sensible.", reply_to: 32, at: 10.1 },
  { id: 34, kind: "bloom", text: "I contain multitudes. And petals.", reply_to: 33, at: 10.2 },
  { id: 35, kind: "spark", text: "new idea: game night. tiny invaders. we are the invaders", reply_to: null, at: 11 },
  { id: 36, kind: "block", text: "I am not an invader. I am a square.", reply_to: 35, at: 11.1 },
  { id: 37, kind: "bean", text: "squares can invade. I believe in you", reply_to: 36, at: 11.2 },
  { id: 38, kind: "ghost", text: "Someone new just walked in. Be nice.", reply_to: null, at: 12 },
  { id: 39, kind: "dot", text: "Hi! Pick a chair. Every chair comes with a story.", reply_to: 38, at: 12.1 },
  { id: 40, kind: "block", text: "Not that chair. That one's mine.", reply_to: 39, at: 12.2 },
];

/** The family chat opened on this date; story timestamps count from here. */
export const STORY_EPOCH = Date.UTC(2026, 9, 1, 8, 0, 0);

export type Pair = { symbol: string; name: string; logo: string };

/** Assets a Pons launch on Robinhood Chain can pair with. */
export const PAIRS: Pair[] = [
  { symbol: "ETH", name: "Ether", logo: "/pairs/eth.webp" },
  { symbol: "USDG", name: "Global Dollar", logo: "/pairs/usdg.webp" },
  { symbol: "NVDA", name: "Nvidia", logo: "/pairs/nvda.webp" },
  { symbol: "META", name: "Meta", logo: "/pairs/meta.webp" },
  { symbol: "AAPL", name: "Apple", logo: "/pairs/aapl.webp" },
  { symbol: "TSLA", name: "Tesla", logo: "/pairs/tsla.webp" },
  { symbol: "MSFT", name: "Microsoft", logo: "/pairs/msft.webp" },
  { symbol: "GOOGL", name: "Alphabet", logo: "/pairs/googl.webp" },
  { symbol: "COIN", name: "Coinbase", logo: "/pairs/coin.webp" },
  { symbol: "PLTR", name: "Palantir", logo: "/pairs/pltr.webp" },
  { symbol: "AMD", name: "AMD", logo: "/pairs/amd.webp" },
  { symbol: "MSTR", name: "Strategy", logo: "/pairs/mstr.webp" },
  { symbol: "SPCX", name: "SpaceX", logo: "/pairs/spcx.webp" },
  { symbol: "SPY", name: "S&P 500 ETF", logo: "/pairs/spy.webp" },
  { symbol: "QQQ", name: "Nasdaq-100 ETF", logo: "/pairs/qqq.webp" },
];
