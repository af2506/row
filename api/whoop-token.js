// Vercel serverless function — exchanges/refreshes WHOOP OAuth2 tokens.
// Keeps WHOOP_CLIENT_SECRET server-side (WHOOP's token endpoint can't be
// called directly from the browser). Configure these in Vercel's project
// env vars:
//   WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET
//
// Request body (JSON):
//   { action: 'exchange', code, redirect_uri }   — authorization_code grant
//   { action: 'refresh', refresh_token }          — refresh_token grant

const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).json({ error: 'server_not_configured', message: 'WHOOP_CLIENT_ID / WHOOP_CLIENT_SECRET env vars are missing.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const params = new URLSearchParams();
  if (body.action === 'refresh') {
    if (!body.refresh_token) {
      res.status(400).json({ error: 'missing_refresh_token' });
      return;
    }
    params.set('grant_type', 'refresh_token');
    params.set('refresh_token', body.refresh_token);
    params.set('scope', 'offline');
  } else {
    if (!body.code || !body.redirect_uri) {
      res.status(400).json({ error: 'missing_code_or_redirect_uri' });
      return;
    }
    params.set('grant_type', 'authorization_code');
    params.set('code', body.code);
    params.set('redirect_uri', body.redirect_uri);
  }
  params.set('client_id', clientId);
  params.set('client_secret', clientSecret);

  try {
    const whoopRes = await fetch(WHOOP_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await whoopRes.json().catch(() => ({}));
    if (!whoopRes.ok) {
      res.status(whoopRes.status).json({ error: 'whoop_token_error', detail: data });
      return;
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: 'whoop_unreachable', message: String(e && e.message || e) });
  }
};
