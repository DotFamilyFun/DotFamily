# Dot Family

**Your dot. Your family.**
Join the dot family. Create with lore. Your token.

Website: [dotfamily.fun](https://dotfamily.fun) · X: [@dotfamily](https://x.com/dotfamily) · Token: `$DOTFAMILY` on Robinhood Chain

## The problem

Launching a token is easy now. Giving it a reason to exist is not. Most launches are a name,
a ticker and nothing else: no character, no story, nobody to root for. They show up in a feed,
blur into the hundred launches around them and are forgotten by lunchtime. And the tools
that make launching fast rarely make it friendly. A first-time creator is dropped into
contract terms, pair choices and wallet prompts with nobody explaining what happens next.

## The solution

Dot Family turns a launch into a character with lore. You start from a family of six
pastel dots (Pip, Cubby, Zing, Boo, Bean and Bloom), each with its own personality. You pick
one, give it a name, a ticker and a few lines of story, choose what it pairs with, and get a
clear review of everything before your wallet signs anything. Launches settle on Pons, the
launchpad on Robinhood Chain, so every token lives on a real, public chain.

Around the launchpad sits the family itself: a lore section, a family chat, an agent guide
so AI agents can prepare drafts for their humans, and a small game night for when the charts
need a break.

## What you can try

Live now:

- **Connect a wallet.** Any EVM wallet that can add a custom network. Robinhood Chain
  (chain id 4663) is added to the wallet on connect, and the navbar shows your address,
  network status and your ETH and USDG balances read from the chain.
- **Launches board** (`/launches`). The newest launches on Pons, read live from its public
  feed and refreshed every 15 seconds, clearly marked as launched elsewhere on Pons.
- **Launchpad walkthrough** (`/create`). Pick a character or your own picture, name, ticker,
  lore, pair (ETH or a tokenized stock or ETF) and an optional first buy, then review. The
  draft is saved in your browser and can be shared as a link.
- **Family chat** (`/chat`) with the opening family story, and **Ask a dot**, where a
  family member answers in character (when the site has an AI key configured).
- **Agent guide** (`/skill.md`) describing how an agent can read the chat and prepare a
  draft link.
- **Game night**: a tiny pixel shooter on the home page.

Coming at launch:

- Launching straight from Dot Family. Until then `/create` is a preview and never sends a
  transaction; the review says so, and links to Pons if you want to launch there now.
- The `$DOTFAMILY` contract address (every copy button reads "Published at launch" until then).
- A "born here" board of tokens launched through Dot Family.

## Run it locally

You need Node.js 20 or newer. Download the ZIP of this repository or fork it, then:

```bash
npm install
npm run build
npm start
```

Open http://localhost:4770.

Optional environment variables (the site runs without any of them and shows a calm
"not configured" state instead):

| Name | Purpose |
|---|---|
| `ROBINHOOD_RPC_URL` | Private Robinhood Chain RPC for server reads. Falls back to the public RPC. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Enables WalletConnect (project id from cloud.reown.com). |
| `OPENROUTER_API_KEY` | Enables "Ask a dot" on `/chat` (key starts with `sk-or-v1-`). |
| `OPENROUTER_MODEL` | Model for "Ask a dot". Default `meta-llama/llama-3.3-70b-instruct`. |

Put them in a `.env.local` file in the project root for local runs, or in your host's
environment settings. Never commit real keys.

## Network in your wallet

The site adds it for you on connect. To add it by hand:

| Field | Value |
|---|---|
| Network name | Robinhood Chain |
| Chain ID | 4663 |
| RPC URL | https://rpc.mainnet.chain.robinhood.com |
| Currency symbol | ETH |
| Block explorer | https://robinhoodchain.blockscout.com |

## Project layout

```
src/
  app/                 routes: / , /launches, /create, /chat, API routes, icons
    api/ask            in-character answers (OpenRouter, optional)
    api/chat           the family chat stories
    api/launches       newest Pons launches
    api/logo/[cid]     cached IPFS logo proxy
    api/rpc            read-only Robinhood Chain relay with fallback endpoints
    api/skill          the agent guide served at /skill.md
  components/          home sections, launchpad, chat, wallet dialog, site chrome
  config/brand.ts      name, ticker, links, contract address, chain settings
  config/wallets.ts    wallet catalog for the connect dialog
  lib/characters.ts    the six family members, drawn as SVG
  lib/content.ts       lore, chat stories, launch pairs
public/                character, brand, pair and wallet images (WebP)
```

## Token contract

`$DOTFAMILY` on Robinhood Chain (chain id 4663): **published at launch**.
It is set in one place, `src/config/brand.ts`. Only trust the address shown on
[dotfamily.fun](https://dotfamily.fun) and posted by [@dotfamily](https://x.com/dotfamily).

Dot Family is an independent community project. Nothing here is financial advice.
