import express from 'express';
import cors from 'cors';

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

// AI Chat endpoint
app.post('/api/ai/chat', (req, res) => {
  const { message, requestId, locale } = req.body;

  // Validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ status: 'error', error: 'Invalid request payload' });
  }

  const now = Date.now();
  if (requestId) {
    const last = rateLimit.get(requestId) || 0;
    if (now - last < 500) {
      return res.status(429).json({ status: 'error', error: 'Too many requests' });
    }
    rateLimit.set(requestId, now);
  }

  // Mock response based on last user message
  const userText = message.toLowerCase();
  const safeRequestId = requestId || Date.now().toString();

  let reply = 'Hello! How can I help you today?';

  if (userText.includes('quote') || userText.includes('price')) {
    reply = 'I can help you get a quote! What type of help do you need? (moving, delivery, recycling, shopping, or home tasks)';
  } else if (userText.includes('book') || userText.includes('help')) {
    reply = 'Great! To book help, I need a few details. What would you like help with?';
  } else if (userText.includes('status') || userText.includes('booking')) {
    reply = 'Let me check your bookings for you...';
  } else if (userText.includes('moving') || userText.includes('furniture')) {
    reply = 'Moving help! I can connect you with helpers who have vehicles. Typical cost is €30-80 depending on size and distance. Ready to post a request?';
  } else if (userText.includes('delivery')) {
    reply = 'Delivery service! Perfect for picking up second-hand items or delivering packages. Typical cost is €15-50. Want to create a delivery request?';
  } else if (userText.includes('recycle') || userText.includes('waste')) {
    reply = 'Recycling help! We can connect you with someone to take items to the recycling center. Eco-friendly and convenient. Cost usually €20-40.';
  }

  setTimeout(() => {
    res.json({
      status: 'ok',
      reply,
      requestId: safeRequestId,
      locale: locale || 'en',
    });
  }, 800); // Simulate network delay
});

app.listen(PORT, () => {
  console.log(`✅ Helpro API server running on http://localhost:${PORT}`);
});
