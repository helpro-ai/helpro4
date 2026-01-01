import express from 'express';
import cors from 'cors';
import { generateAssistantResponse, sanitizeText } from '../api/utils/assistantEngine.js';

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const rateLimit = new Map();

// Health check endpoint (matches api/health.ts)
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.options('/api/health', (req, res) => {
  res.status(204).end();
});

// AI Chat endpoint (matches api/ai/chat.ts)
app.post('/api/ai/chat', (req, res) => {
  const { message, requestId, locale, conversationState } = req.body;

  // Validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ status: 'error', error: 'Invalid request payload' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ status: 'error', error: 'Message too long (max 2000 characters)' });
  }

  const now = Date.now();
  if (requestId) {
    const last = rateLimit.get(requestId) || 0;
    if (now - last < 500) {
      return res.status(429).json({ status: 'error', error: 'Too many requests' });
    }
    rateLimit.set(requestId, now);
  }

  const safeRequestId = requestId || `req-${Date.now()}`;

  try {
    // Generate context-aware response with state machine (same as production)
    const previousState = conversationState || null;
    const assistantResponse = generateAssistantResponse(message, locale || 'en', previousState, safeRequestId);

    setTimeout(() => {
      res.json({
        status: 'ok',
        requestId: safeRequestId,
        reply: sanitizeText(assistantResponse.reply),
        conversationState: assistantResponse.nextState, // Return updated state
        suggestedActions: assistantResponse.suggestedActions,
      });
    }, 800); // Simulate network delay
  } catch (error) {
    console.error('[Express] Error processing message:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Internal server error',
    });
  }
});

// Catch-all 404 handler - return JSON instead of HTML
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: 'Not found',
  });
});

app.listen(PORT, () => {
  console.log(`✅ Helpro API server running on http://localhost:${PORT}`);
});
