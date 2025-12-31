import express from 'express';
import cors from 'cors';
import { analyzeMessage } from '../api/utils/nlp.js';
import { buildReply } from '../api/utils/replyBuilder.js';

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const rateLimit = new Map();

// Sanitize text output (prevent HTML injection)
function sanitizeText(text) {
  return text.replace(/<[^>]*>/g, '').trim();
}

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
  const { message, requestId, locale } = req.body;

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
    // Analyze message with NLP (same as production)
    const nlpResult = analyzeMessage(message, locale);

    // Generate contextual multilingual reply (same as production)
    const reply = buildReply(nlpResult);

    setTimeout(() => {
      res.json({
        status: 'ok',
        requestId: safeRequestId,
        reply: sanitizeText(reply),
        meta: nlpResult, // Include NLP analysis in response
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
