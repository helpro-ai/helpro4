import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeMessage } from '../utils/nlp';

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

    // Generate contextual reply based on intent
    let reply = '';

    switch (nlpResult.intent) {
      case 'BOOK_SERVICE':
        if (nlpResult.category) {
          reply = `I understand you need help with ${nlpResult.category.replace('-', ' ')}. `;
          if (nlpResult.entities.location) {
            reply += `Location: ${nlpResult.entities.location}. `;
          }
          if (nlpResult.entities.timing) {
            reply += `Timing: ${nlpResult.entities.timing}. `;
          }
          reply += 'You can post your request to find available helpers.';
        } else {
          reply = 'I can help you find the right service. What type of help do you need?';
        }
        break;

      case 'PROVIDER_SIGNUP':
        reply = 'Interested in becoming a helper? Great! You can sign up to offer your services.';
        break;

      case 'GENERAL_QA':
        reply = 'I can answer questions about our services, pricing, and how the platform works. What would you like to know?';
        break;

      default:
        reply = 'Hello! I can help you book services or answer questions. What do you need?';
    }

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
