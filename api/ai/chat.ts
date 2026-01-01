import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAssistantResponse, sanitizeText as sanitize } from '../utils/assistantEngine.js';
import { applySecurityHeaders } from '../utils/securityHeaders.js';
import type { ConversationState } from '../utils/conversationState.js';

// Vercel runtime configuration
export const config = {
  runtime: 'nodejs20.x',
};

function respond(res: VercelResponse, status: number, payload: Record<string, unknown>) {
  applySecurityHeaders(res, { methods: 'POST,OPTIONS', headers: 'Content-Type,X-Request-ID' });
  res.status(status).json(payload);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    applySecurityHeaders(res, { methods: 'POST,OPTIONS', headers: 'Content-Type,X-Request-ID' });
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

  const { message, requestId, locale, conversationState } = body;

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
    // Generate context-aware response with state machine (now async for Python NLP)
    const previousState = conversationState as ConversationState | null;
    const assistantResponse = await generateAssistantResponse(message, locale || 'en', previousState, safeRequestId);

    return respond(res, 200, {
      status: 'ok',
      requestId: safeRequestId,
      reply: sanitize(assistantResponse.reply),
      conversationState: assistantResponse.nextState, // Return updated state
      suggestedActions: assistantResponse.suggestedActions,
    });
  } catch (error: any) {
    console.error('[API] Error processing message:', error);
    return respond(res, 500, {
      status: 'error',
      error: 'Internal server error',
    });
  }
}
