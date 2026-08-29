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

`health.html` has a WHOOP card (recovery / sleep / strain) at the top of the page. It's off until you connect it:

1. Create a free app at `developer.whoop.com`.
2. Set its Redirect URL to `https://your-site.vercel.app/api/whoop-callback`.
3. In your Vercel project → Settings → Environment Variables, add `WHOOP_CLIENT_ID`, `WHOOP_CLIENT_SECRET`, and `WHOOP_REDIRECT_URI` (same value as the Redirect URL above), then redeploy.
4. The Client ID is hardcoded into `health.html`'s WHOOP script (it's not secret — OAuth client IDs are meant to be public) — swap in your own if you fork this. The Client Secret only ever lives in the Vercel env var above; it's never committed to the repo.
5. On the health page, hit **Connect WHOOP**.

Three Vercel serverless functions handle the OAuth/data flow — none of them expose `WHOOP_CLIENT_SECRET` to the browser:
- [api/whoop-callback.js](api/whoop-callback.js) — receives the OAuth redirect, exchanges the code for tokens, redirects back to `health.html` with the tokens in the URL fragment.
- [api/whoop-refresh.js](api/whoop-refresh.js) — refreshes an expired access token.
- [api/whoop-data.js](api/whoop-data.js) — proxies authenticated reads to the WHOOP API (v1 for `/cycle`, v2 for everything else).

Tokens are stored in `localStorage` only and are deliberately excluded from the Supabase cloud sync used elsewhere in the dashboard.

## Building from scratch

[BUILD_DASHBOARD.md](BUILD_DASHBOARD.md) is the prompt I gave Claude to generate `index.html` — paste it into Claude if you want to rebuild that page yourself.
