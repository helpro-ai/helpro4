import type { VercelRequest, VercelResponse } from '@vercel/node';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function safeJsonBody(req: VercelRequest): any {
  const body: any = (req as any).body;
  if (!body) return {};

  // Vercel معمولاً object می‌دهد، ولی برای اطمینان:
  if (Buffer.isBuffer(body)) {
    try { return JSON.parse(body.toString('utf8')); } catch { return {}; }
  }
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch { return {}; }
  }
  if (typeof body === 'object') return body;

  return {};
}

type VerifyBody = {
  email?: string;
  code?: string;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const body = safeJsonBody(req) as VerifyBody;
  const email = body.email;
  const code = body.code;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing email' });
  }
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing code' });
  }

  // SECURITY FIX: Only allow dev bypass in non-production environments
  const isProd = process.env.NODE_ENV === 'production';

  let isValid = false;

  if (isProd) {
    // Production: Must use real verification logic
    // TODO: Implement actual email verification with temporary codes stored in DB
    // For now, reject all codes in production to prevent security bypass
    return res.status(400).json({ ok: false, error: 'Verification not yet implemented for production' });
  } else {
    // Development only: accept 123456 for testing
    isValid = code === '123456';
  }

  if (!isValid) {
    return res.status(400).json({ ok: false, error: 'Invalid code' });
  }

  return res.status(200).json({ ok: true });
}
