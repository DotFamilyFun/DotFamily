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
clear review of everything before your wallet signs anything: the exact contract, the Pons
launch fee, the estimated network fee and a dry run of the launch against the live chain.
Then your own wallet launches the token on Pons V2, the launchpad on Robinhood Chain, so
every token lives on a real, public chain.

Around the launchpad sits the family itself: a lore section, a family chat, an agent guide
so AI agents can prepare drafts for their humans, and a small game night for when the charts
need a break.

## What you can try

Live now:

- **Connect a wallet.** Any EVM wallet that can add a custom network. Robinhood Chain
  (chain id 4663) is added to the wallet on connect, and the navbar shows your address,
  network status and your ETH and USDG balances read from the chain.
- **Launch a real token** (`/create`). Pick a character (or upload your own picture when
  the site has a picture host configured), name, ticker, lore, optional X, Telegram and
  Website links (handles like `@name` become full links; an empty website points to
  dotfamily.fun), pair (ETH,
  USDG or a tokenized stock or ETF), creator fee and an optional first buy on ETH pairs.
  The review reads every Pons term live, simulates the launch and shows the contract,
  launch fee (0.0005 ETH at the time of writing, always read live), network fee estimate
  and your balance. Your wallet signs and pays; the site never holds keys or funds. After
  sending you see the pending transaction, the confirmation and the new token address with
  links to Pons and the explorer.
- **Launches board** (`/launches`). Dots launched from your browser, each checked against
  its own launch transaction on the chain, plus the newest launches on Pons, read live from its public feed and clearly
  marked as launched elsewhere on Pons.
- **Family chat** (`/chat`) with the opening family story, and **Ask a dot**, where a
  family member answers in character (when the site has an AI key configured).
- **Agent guide** (`/skill.md`) describing how an agent can read the chat and prepare a
  draft link for its human to review and sign.
- **Game night**: a tiny pixel shooter on the home page.

Coming next:

- The `$DOTFAMILY` contract address (every copy button reads "Published at launch" until then).
- A site-wide board of every dot born here. Each launch already carries `dotfamily.fun` in
  its on-chain website slot, so they can be found and verified by anyone.

How a launch is built:

- Without a first buy: `launchToken(params, 0, pair)` on the Pons V2 factory
  `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e`, sending exactly the live `launchFee()`.
- With a first buy (ETH pairs): `launchAndBuy(...)` on the Pons launch-and-buy forwarder
  `0xe33E9E479dF8802cb0866d5d05258bEc4cF62948`, sending the fee plus the buy, with a 5%
  minimum-output floor. It is used only while the factory still names it as its forwarder.
- The new token address is read from the factory's `TokenLaunched` event in the receipt.

## Run it locally

You need Node.js 20 or newer. Download the ZIP of this repository or fork it, then:

```bash
npm install
cp .env.example .env.local   # optional: fill in only what you need
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
| `PINATA_JWT` | Enables custom picture upload on `/create` (Pinata JWT with pinFileToIPFS). Without it the character art is used. |
| `PINATA_GATEWAY` | IPFS gateway for picture links. Default `https://ipfs.io/ipfs/`. |

`.env.example` lists every variable with its format and where to get it. Copy it to
`.env.local` in the project root for local runs, or set the values in your host's
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
    api/upload         picture upload to IPFS (optional)
  abi/                 Pons V2 contract interfaces (verified deployments)
  components/          home sections, launchpad, chat, wallet dialog, site chrome
  config/brand.ts      name, ticker, links, contract address, chain settings
  config/wallets.ts    wallet catalog for the connect dialog
  lib/characters.ts    the six family members, drawn as SVG
  lib/content.ts       lore, chat stories, launch pairs
  lib/launch/          live Pons reads, launch simulation, receipt parsing
public/                character, brand, pair and wallet images (WebP)
```

## Token contract

`$DOTFAMILY` on Robinhood Chain (chain id 4663): **published at launch**.
It is set in one place, `src/config/brand.ts`. Only trust the address shown on
[dotfamily.fun](https://dotfamily.fun) and posted by [@dotfamily](https://x.com/dotfamily).

Dot Family is an independent community project. Nothing here is financial advice.
