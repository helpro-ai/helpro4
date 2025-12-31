import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAssistantResponse, sanitizeText as sanitize } from '../utils/assistantEngine.js';
import type { ConversationState } from '../utils/conversationState.js';

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
    // Generate context-aware response with state machine
    const previousState = conversationState as ConversationState | null;
    const assistantResponse = generateAssistantResponse(message, locale || 'en', previousState);

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
