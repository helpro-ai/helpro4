# Deployment Guide

## Quick Start

### Local Development (No Docker)
```bash
# Install dependencies
npm install

# Terminal 1: Vite dev server
npm run dev

# Terminal 2: Express API server
npm run dev:api

# Visit http://localhost:5173
```

### Local Development (With Docker)
```bash
# Create .env file
cp .env.example .env

# Edit .env with your values
GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Start all services
docker-compose up

# Visit http://localhost:5173
```

## Environment Variables

### Required for All Environments
```bash
# Google OAuth
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
```

### Production Only
```bash
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Optional
```bash
# Python NLP Service
NLP_URL=https://your-nlp-service.com
NLP_TIMEOUT_MS=1200
NLP_LOG_LEVEL=INFO
NLP_STORE_REQUESTS=false

# Server
PORT=3001
```

## Vercel Deployment

### 1. Frontend + API (Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
```

**Environment Variables in Vercel Dashboard:**
```
GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.vercel.app
NLP_URL=https://your-nlp-service.com (optional)
```

**vercel.json** (if not present):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

### 2. Python NLP Service (Separate)

#### Option A: Cloud Run (Google Cloud)
```bash
cd services/nlp

# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT/helpro-nlp
gcloud run deploy helpro-nlp \
  --image gcr.io/YOUR_PROJECT/helpro-nlp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NLP_LOG_LEVEL=INFO,ALLOWED_ORIGINS=https://your-domain.vercel.app"

# Get service URL
gcloud run services describe helpro-nlp --region us-central1 --format='value(status.url)'

# Add NLP_URL to Vercel env vars
```

#### Option B: Fly.io
```bash
cd services/nlp

# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login and launch
fly launch

# Deploy
fly deploy

# Set env vars
fly secrets set NLP_LOG_LEVEL=INFO
fly secrets set ALLOWED_ORIGINS=https://your-domain.vercel.app

# Get URL: https://your-app.fly.dev
```

#### Option C: Render
```bash
# Create web service
# Connect GitHub repo
# Root directory: services/nlp
# Build command: pip install -r requirements.txt
# Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
# Add env vars in Render dashboard
```

## Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create project or select existing
3. Enable "Google+ API"
4. Credentials > Create Credentials > OAuth 2.0 Client ID
5. Application type: Web application
6. Add Authorized JavaScript origins:
   ```
   http://localhost:5173
   https://your-domain.vercel.app
   https://your-preview-*.vercel.app
   ```
7. No redirect URIs needed (using implicit flow)
8. Copy Client ID to both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`

## Docker Deployment (Self-Hosted)

### Production Docker Compose
```yaml
version: '3.8'

services:
  nlp:
    build: ./services/nlp
    environment:
      - NLP_LOG_LEVEL=INFO
      - NLP_STORE_REQUESTS=false
      - ALLOWED_ORIGINS=https://your-domain.com
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./dist:/usr/share/nginx/html
      - ./letsencrypt:/etc/letsencrypt
    restart: always
```

## Health Checks

### API Health
```bash
curl https://your-domain.vercel.app/api/health
# Expected: {"ok":true,"message":"healthy","timestamp":"..."}
```

### NLP Health
```bash
curl https://your-nlp-service.com/health
# Expected: {"ok":true,"version":"1.0.0","uptime":123.45}
```

## Monitoring

### Check Circuit Breaker Status
```bash
# Add to Express server:
app.get('/api/nlp/status', (req, res) => {
  const { getCircuitBreakerStatus } = require('../api/utils/pythonNlpClient.js');
  res.json(getCircuitBreakerStatus());
});
```

### Logs
```bash
# Vercel
vercel logs --follow

# Cloud Run
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Fly.io
fly logs

# Docker
docker-compose logs -f nlp
```

## Troubleshooting

### Python NLP Fails
- **Symptom**: Chat works but slower, logs show "Used JS NLP fallback"
- **Cause**: NLP_URL not set or service down
- **Fix**: Check NLP service health, verify NLP_URL, check firewall rules

### Auth Fails
- **Symptom**: "Invalid credential" or "Verification failed"
- **Cause**: Mismatched client IDs, wrong authorized origins
- **Fix**: Verify `GOOGLE_CLIENT_ID === VITE_GOOGLE_CLIENT_ID`, check Google Console origins

### CORS Errors
- **Symptom**: "blocked by CORS policy" in browser
- **Cause**: ALLOWED_ORIGINS doesn't include your domain
- **Fix**: Add your domain to `ALLOWED_ORIGINS` (comma-separated), redeploy

### Build Fails
```bash
# Clear caches
rm -rf node_modules dist .vercel
npm install
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## Performance Optimization

### Enable Python NLP Caching (Optional)
```python
# services/nlp/main.py
from functools import lru_cache

@lru_cache(maxsize=1000)
def classify_intent_cached(text: str, locale: str):
    return classify_intent(text, locale)
```

### CDN for Static Assets
- Vercel handles this automatically
- For self-hosted: Use Cloudflare or nginx caching

### Database (Future)
- Currently stateless (no DB needed)
- For persistent auth: Add PostgreSQL/MongoDB
- For conversations: Add Redis for session store

## Security Checklist

- [ ] `NODE_ENV=production` in production
- [ ] `ALLOWED_ORIGINS` set to your domains only
- [ ] HTTPS enabled (automatic on Vercel/Cloud Run)
- [ ] Google OAuth origins configured correctly
- [ ] Secrets in environment variables, not code
- [ ] `.env` files git-ignored
- [ ] Regular `npm audit` and `pip check`
- [ ] Rate limiting enabled (already in Express server)
- [ ] Security headers applied (already in code)

## Rollback

### Vercel
```bash
vercel rollback
```

### Cloud Run
```bash
gcloud run services update-traffic helpro-nlp --to-revisions=PREVIOUS_REVISION=100
```

### Docker
```bash
docker-compose down
git checkout previous-commit
docker-compose up -d
```
