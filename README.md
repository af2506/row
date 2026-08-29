# Personal Dashboard

A set of small, self-contained HTML apps that share a top bar.

## Deploy your own copy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRowanThistlebrooke%2FYTdashh1)

One click → Vercel signs you in, copies the repo to your GitHub, and deploys it. ~30 seconds to a live URL.

## How to use

Open any `.html` file directly in your browser — no build step, no install.

| File | What it is |
|---|---|
| [index.html](index.html) | Goals tracker (Day Ring, Goal Ticker, To Do list) — the home page |
| [health.html](health.html) | Supplement / daily stack tracker |
| [po-water.html](po-water.html) | Water intake tracker |
| [finance.html](finance.html) | Finances |
| [gym.html](gym.html) | Progressive overload gym tracker |
| [topbar.js](topbar.js) | Shared top bar — auto-injected into pages that `<script src="topbar.js">` |

Each app stores its own state in browser `localStorage`. No accounts, no server — except the WHOOP widget on `health.html`, which needs one small serverless function.

### WHOOP widget (optional)

`health.html` has a WHOOP card (recovery / sleep stages / strain) at the top of the page. It's off until you connect it:

1. Create a free app at `developer.whoop.com`.
2. Set its redirect URL to your deployed `health.html` URL (e.g. `https://your-site.vercel.app/health.html`).
3. In your Vercel project → Settings → Environment Variables, add `WHOOP_CLIENT_ID` and `WHOOP_CLIENT_SECRET`, then redeploy.
4. On the health page, tap the gear icon on the WHOOP card and paste the same Client ID, then hit **Connect WHOOP**.

[api/whoop-token.js](api/whoop-token.js) is a Vercel serverless function that exchanges/refreshes the OAuth token — it's the only piece that touches your `WHOOP_CLIENT_SECRET`, which never reaches the browser. Tokens are stored in `localStorage` only and are deliberately excluded from the Supabase cloud sync used elsewhere in the dashboard.

## Building from scratch

[BUILD_DASHBOARD.md](BUILD_DASHBOARD.md) is the prompt I gave Claude to generate `index.html` — paste it into Claude if you want to rebuild that page yourself.
