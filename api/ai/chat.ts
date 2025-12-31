import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeMessage } from '../utils/nlp.js';
import { buildReply } from '../utils/replyBuilder.js';

function respond(res: VercelResponse, status: number, payload: Record<string, unknown>) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(status).json(payload);
}

// Sanitize text output (prevent HTML injection)
function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
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

  const { message, requestId, locale } = body;

  if (!message || typeof message !== 'string') {
    return respond(res, 400, { status: 'error', error: 'Message is required' });
  }

  if (message.length > 2000) {
    return respond(res, 400, { status: 'error', error: 'Message too long (max 2000 characters)' });
  }

  const safeRequestId = typeof requestId === 'string' && requestId.trim().length > 0
    ? requestId
    : `req-${Date.now()}`;

  try {
    // Analyze message with NLP
    const nlpResult = analyzeMessage(message, locale);

    // Generate contextual multilingual reply
    const reply = buildReply(nlpResult);

    return respond(res, 200, {
      status: 'ok',
      requestId: safeRequestId,
      reply: sanitizeText(reply),
      meta: nlpResult, // Include NLP analysis in response
    });
  } catch (error: any) {
    console.error('[API] Error processing message:', error);
    return respond(res, 500, {
      status: 'error',
      error: 'Internal server error',
    });
  }
}
