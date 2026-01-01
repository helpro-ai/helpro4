import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function safeJsonBody(req: VercelRequest): any {
  const body: any = (req as any).body;
  if (!body) return {};

  // Vercel usually gives an object, but handle string/buffer just in case
  if (Buffer.isBuffer(body)) {
    try { return JSON.parse(body.toString('utf8')); } catch { return {}; }
  }

  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch { return {}; }
  }

  if (typeof body === 'object') return body;
  return {};
}

function getClientId() {
  // Prefer server env var, fallback to VITE_* for dev convenience
  return process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const clientId = getClientId();
  if (!clientId) {
    return res.status(500).json({
      ok: false,
      error: 'Server not configured (missing GOOGLE_CLIENT_ID)',
      hint: 'Set GOOGLE_CLIENT_ID on server env. (VITE_GOOGLE_CLIENT_ID is client-side)',
    });
  }

  const { credential } = safeJsonBody(req);
  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing credential' });
  }

  try {
    const oauth = new OAuth2Client(clientId);

    const ticket = await oauth.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const email = payload?.email ?? null;
    const verified = !!payload?.email_verified;

    return res.status(200).json({
      ok: true,
      verified,
      email,
      name: payload?.name ?? null,
      picture: payload?.picture ?? null,
    });
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'Invalid credential' });
  }
}
