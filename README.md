# Helpro

Helpro is a demo marketplace for everyday help inspired by peer-to-peer services. It includes:

- React + Vite front-end with marketing pages, dashboard, requests/bookings, messaging, and profile screens.
- AI assistant chat widget with multilingual NLP support.
- Local Express mock API + Vercel serverless functions for production.

## Getting started

### Development

Run both servers in separate terminals:

**Terminal 1 - Frontend (Vite):**
```bash
npm install
npm run dev
```

**Terminal 2 - Backend (Express Mock API):**
```bash
npm run dev:api
```

**Or run both together:**
```bash
npm run dev:full
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to the Express server at `http://localhost:8080`.

### Testing Local API Endpoints

**Health check:**
```bash
curl -i http://localhost:8080/api/health
```

**Chat endpoint:**
```bash
curl -i http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"I need cleaning help","locale":"en","requestId":"test-1"}'
```

## Building for production

```bash
npm run build
```

## Production Deployment

Production uses Vercel serverless functions under `/api`:
- `/api/health.ts` - Health check endpoint
- `/api/ai/chat.ts` - AI chat with multilingual NLP
