import type { VercelRequest, VercelResponse } from '@vercel/node';

function respond(res: VercelResponse, status: number, payload: Record<string, unknown>) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(status).json(payload);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return respond(res, 405, { status: 'error', error: 'Method not allowed' });
  }

  let body: any = req.body;
  if (!body || typeof body !== 'object') {
    try {
      body = JSON.parse(req.body as any);
    } catch (error) {
      return respond(res, 400, { status: 'error', error: 'Invalid JSON body' });
    }
  }

  const { message, requestId } = body;

  if (!message || typeof message !== 'string') {
    return respond(res, 400, { status: 'error', error: 'Message is required' });
  }

  const safeRequestId = typeof requestId === 'string' && requestId.trim().length > 0
    ? requestId
    : `req-${Date.now()}`;

  return respond(res, 200, {
    status: 'ok',
    requestId: safeRequestId,
    reply: `Echo: ${message}`,
  });
}
