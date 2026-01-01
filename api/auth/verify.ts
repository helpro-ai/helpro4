import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { email, code } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ ok: false, error: 'Missing parameters' });
  }

  // Accept '123456' as dev-code; otherwise in this minimal implementation accept any 6-digit code.
  if (code === '123456' || /^[0-9]{6}$/.test(code)) {
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ ok: false, error: 'Invalid code' });
}
