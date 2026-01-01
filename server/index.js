import express from 'express';
import cors from 'cors';
import { generateAssistantResponse, sanitizeText } from '../api/utils/assistantEngine.js';

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// JSON parse error handler (must come after express.json())
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      error: 'Invalid JSON body',
    });
  }
  next();
});

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
app.post('/api/ai/chat', async (req, res) => {
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
    // Generate context-aware response with state machine (now async for Python NLP)
    const previousState = conversationState || null;
    const assistantResponse = await generateAssistantResponse(message, locale || 'en', previousState, safeRequestId);

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

// Auth endpoints parity for local development
app.post('/api/auth/register', (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing email' });
  }
  return res.json({ ok: true, needsVerification: true });
});

app.post('/api/auth/verify', (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ ok: false, error: 'Missing parameters' });
  }
  if (code === '123456' || /^[0-9]{6}$/.test(code)) {
    return res.json({ ok: true });
  }
  return res.status(400).json({ ok: false, error: 'Invalid code' });
});

app.post('/api/auth/google', (req, res) => {
  const { credential } = req.body || {};
  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing credential' });
  }
  let email = null;
  try {
    const payload = JSON.parse(Buffer.from(credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    email = payload?.email || null;
  } catch (e) {
    // ignore
  }
  return res.json({ ok: true, verified: !!email, email });
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
