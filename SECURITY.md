# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to us via email at **security@helpro.app** (or create a private security advisory on GitHub).

**Do not** open public issues for security vulnerabilities.

We will acknowledge receipt within 48 hours and provide a detailed response within 5 business days.

## Security Measures

### Authentication
- Google OAuth 2.0 for production authentication
- Email verification disabled in production pending proper implementation
- Development mode uses fixed code (`123456`) for testing only
- Never use `NODE_ENV=production` with dev authentication

### Data Protection
- All API endpoints validate input types and lengths
- User messages limited to 2000 characters
- PII scrubbing in production logs
- No persistent storage of conversation data on server

### Network Security
- HTTPS enforced in production (HSTS header)
- CORS restricted to allowed origins in production (`ALLOWED_ORIGINS` env var)
- Content Security Policy prevents XSS attacks
- Frame protection prevents clickjacking

### API Security
- Rate limiting on authentication and AI chat endpoints
- Request validation with type checking
- Circuit breaker pattern for external services (Python NLP)
- Timeouts on all external calls (1200ms for NLP service)

### Dependencies
- Regular `npm audit` scans recommended
- Python dependencies pinned in `requirements.txt`
- No known critical vulnerabilities at time of release

## Environment Variables

### Required for Production
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (backend verification)
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID (frontend)
- `NODE_ENV=production` - Enables production security mode
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

### Optional
- `NLP_URL` - Python NLP service URL (enables enhanced NLP)
- `NLP_TIMEOUT_MS` - Timeout for Python NLP (default: 1200)
- `NLP_LOG_LEVEL` - Logging verbosity (INFO, DEBUG, ERROR)

### Development Only
- Never set `NODE_ENV=production` with dev email verification
- Use `.env.local` for local secrets (git-ignored)

## Google OAuth Setup

1. Create project at https://console.cloud.google.com
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized JavaScript origins:
   - `http://localhost:5173` (local dev)
   - `https://your-preview-url.vercel.app` (preview)
   - `https://your-domain.com` (production)
5. Add redirect URIs (not needed for implicit flow)
6. Set both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` to same value

## Known Limitations

- Email verification not yet implemented for production (auth/verify returns error)
- No database persistence - conversation state stored client-side only
- Rate limiting uses in-memory store (resets on server restart)
- Python NLP service optional - system falls back to JS NLP if unavailable

## Compliance

This project implements baseline security controls aligned with:
- OWASP ASVS (Application Security Verification Standard) Level 1
- OWASP Top 10 mitigations
- GDPR principles (data minimization, no unnecessary persistence)
- WCAG 2.1 AA accessibility guidelines

See also:
- [PRIVACY.md](PRIVACY.md) - Data handling and privacy practices
- [ACCESSIBILITY.md](ACCESSIBILITY.md) - Accessibility compliance
- [DEPLOYMENT.md](DEPLOYMENT.md) - Secure deployment guide
