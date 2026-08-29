export default async function handler(req, res) {
  const code = req.query && req.query.code;
  if (req.query && req.query.error) return res.status(400).send('WHOOP auth error: ' + req.query.error);
  if (!code) return res.status(400).send('Missing code parameter.');
  const rawClientId     = process.env.WHOOP_CLIENT_ID || '';
  const rawClientSecret = process.env.WHOOP_CLIENT_SECRET || '';
  const rawRedirectUri  = process.env.WHOOP_REDIRECT_URI || '';
  // Trim defensively — a trailing newline/space from copy-pasting into
  // Vercel's env var UI is a common, invisible cause of invalid_client.
  const clientId     = rawClientId.trim();
  const clientSecret = rawClientSecret.trim();
  const redirectUri  = rawRedirectUri.trim();
  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).send('Server not configured (missing WHOOP_* env vars).');
  }
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code', code, redirect_uri: redirectUri,
      client_id: clientId, client_secret: clientSecret,
    });
    const tokenRes = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const text = await tokenRes.text();
    if (!tokenRes.ok) {
      // Diagnostic only — never includes the secret itself, just enough
      // to tell whether Vercel's stored value differs from what's expected.
      const debug = {
        client_id_used: clientId,
        client_id_length: clientId.length,
        client_secret_length: clientSecret.length,
        client_secret_had_whitespace: rawClientSecret !== clientSecret,
        client_id_had_whitespace: rawClientId !== clientId,
        redirect_uri_used: redirectUri,
        redirect_uri_had_whitespace: rawRedirectUri !== redirectUri,
      };
      return res.status(500).send('WHOOP token exchange failed: ' + text + '\n\nDEBUG: ' + JSON.stringify(debug, null, 2));
    }
    let json;
    try { json = JSON.parse(text); } catch { return res.status(500).send('Non-JSON: ' + text); }
    const access = json.access_token || '';
    const refresh = json.refresh_token || '';
    const expiresIn = json.expires_in || 3600;
    const hash = new URLSearchParams({
      whoop_access: access, whoop_refresh: refresh,
      whoop_expires: String(Date.now() + expiresIn * 1000),
    }).toString();
    res.writeHead(302, { Location: '/health.html#' + hash });
    res.end();
  } catch (e) {
    res.status(500).send('Unexpected: ' + (e.message || String(e)));
  }
}
