// Security headers middleware for OWASP compliance
// @ts-check

/**
 * Apply security headers to response
 * @param {any} res - Express or Vercel response object
 * @param {object} [options] - Configuration options
 */
export function applySecurityHeaders(res, options = {}) {
  const isProd = process.env.NODE_ENV === 'production';
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com" + (process.env.NLP_URL ? ` ${process.env.NLP_URL}` : ''),
    "frame-src https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS only in production
  if (isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // CORS handling
  const origin = options.origin || '*';
  if (allowedOrigins.length > 0 && origin !== '*') {
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else if (!isProd) {
    // Development: allow all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.length > 0) {
    // Production with configured origins
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', options.methods || 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', options.headers || 'Content-Type,X-Request-ID');
  res.setHeader('Access-Control-Max-Age', '86400');
}
