// Python NLP Client with fail-safe, timeouts, and circuit breaker
// @ts-check

/**
 * @typedef {'en' | 'sv' | 'de' | 'es' | 'fa'} Locale
 * @typedef {'BOOK_SERVICE' | 'PROVIDER_SIGNUP' | 'GENERAL_QA' | 'UNKNOWN'} IntentType
 * @typedef {{
 *   language: Locale;
 *   intent: IntentType;
 *   category?: string;
 *   entities: {
 *     location?: string;
 *     timing?: string;
 *     budget?: string;
 *     hours?: number;
 *     items?: number;
 *     rooms?: number;
 *   };
 *   kb_hit?: {
 *     matched: boolean;
 *     category?: string;
 *     answer_key?: string;
 *     confidence: number;
 *   };
 *   confidence: number;
 *   request_id?: string;
 * }} PythonNLPResponse
 */

const NLP_URL = process.env.NLP_URL || '';
const NLP_TIMEOUT_MS = parseInt(process.env.NLP_TIMEOUT_MS || '1200', 10);
const NLP_ENABLED = Boolean(NLP_URL);

// Circuit breaker state
const circuitBreaker = {
  failureCount: 0,
  failureThreshold: 3, // Open circuit after 3 consecutive failures
  resetTimeoutMs: 60000, // Reset after 60 seconds
  state: 'CLOSED', // CLOSED | OPEN | HALF_OPEN
  nextAttemptTime: 0,
};

/**
 * Log structured message (scrub PII in production)
 * @param {string} level
 * @param {string} message
 * @param {Record<string, any>} [meta]
 */
function log(level, message, meta = {}) {
  const isProd = process.env.NODE_ENV === 'production';
  const timestamp = new Date().toISOString();

  // Scrub PII from metadata in production
  if (isProd && meta.message) {
    meta.message = meta.message.substring(0, 20) + '...'; // Truncate user message
  }

  const logEntry = {
    timestamp,
    level,
    service: 'pythonNlpClient',
    message,
    ...meta,
  };

  if (level === 'ERROR' || level === 'WARN') {
    console.error(JSON.stringify(logEntry));
  } else if (process.env.NLP_LOG_LEVEL === 'DEBUG' || process.env.NLP_LOG_LEVEL === 'INFO') {
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Update circuit breaker state
 * @param {boolean} success
 */
function updateCircuitBreaker(success) {
  if (success) {
    circuitBreaker.failureCount = 0;
    if (circuitBreaker.state === 'HALF_OPEN') {
      circuitBreaker.state = 'CLOSED';
      log('INFO', 'Circuit breaker closed after successful request');
    }
  } else {
    circuitBreaker.failureCount++;

    if (circuitBreaker.failureCount >= circuitBreaker.failureThreshold) {
      circuitBreaker.state = 'OPEN';
      circuitBreaker.nextAttemptTime = Date.now() + circuitBreaker.resetTimeoutMs;
      log('WARN', 'Circuit breaker opened due to consecutive failures', {
        failureCount: circuitBreaker.failureCount,
        resetIn: circuitBreaker.resetTimeoutMs,
      });
    }
  }
}

/**
 * Check if circuit breaker allows request
 * @returns {boolean}
 */
function canAttemptRequest() {
  if (circuitBreaker.state === 'CLOSED') {
    return true;
  }

  if (circuitBreaker.state === 'OPEN') {
    if (Date.now() >= circuitBreaker.nextAttemptTime) {
      circuitBreaker.state = 'HALF_OPEN';
      log('INFO', 'Circuit breaker transitioning to HALF_OPEN');
      return true;
    }
    return false;
  }

  // HALF_OPEN: allow one request to test
  return true;
}

/**
 * Call Python NLP service with timeout and fail-safe
 * @param {string} message - User message to analyze
 * @param {Locale} [locale] - User locale
 * @param {string} [requestId] - Request ID for tracing
 * @returns {Promise<PythonNLPResponse | null>}
 */
export async function analyzeMessageWithPython(message, locale = 'en', requestId) {
  // Check if NLP service is enabled
  if (!NLP_ENABLED) {
    log('DEBUG', 'Python NLP disabled (NLP_URL not set)');
    return null;
  }

  // Check circuit breaker
  if (!canAttemptRequest()) {
    log('WARN', 'Circuit breaker OPEN, skipping Python NLP', {
      requestId,
      nextAttemptIn: circuitBreaker.nextAttemptTime - Date.now(),
    });
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NLP_TIMEOUT_MS);

  try {
    log('INFO', 'Calling Python NLP service', { requestId, locale });

    const response = await fetch(`${NLP_URL}/nlp/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId || '',
      },
      body: JSON.stringify({
        message,
        locale,
        request_id: requestId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Python NLP HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data.intent !== 'string') {
      throw new Error('Invalid Python NLP response structure');
    }

    log('INFO', 'Python NLP response received', {
      requestId,
      intent: data.intent,
      category: data.category,
      confidence: data.confidence,
    });

    updateCircuitBreaker(true);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    const isTimeout = error.name === 'AbortError';
    const errorMessage = isTimeout ? 'Python NLP timeout' : `Python NLP error: ${error.message}`;

    log('ERROR', errorMessage, {
      requestId,
      isTimeout,
      error: error.message,
    });

    updateCircuitBreaker(false);
    return null;
  }
}

/**
 * Get circuit breaker status (for monitoring)
 * @returns {{state: string, failureCount: number, nextAttemptTime: number}}
 */
export function getCircuitBreakerStatus() {
  return {
    state: circuitBreaker.state,
    failureCount: circuitBreaker.failureCount,
    nextAttemptTime: circuitBreaker.nextAttemptTime,
  };
}
