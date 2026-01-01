// Service Resolver: Match user requests to KNOWN/MAPPED/CUSTOM services
// @ts-check

import { SERVICE_CATALOG, getServiceById } from './serviceCatalog.js';

/**
 * @typedef {'en' | 'sv' | 'de' | 'es' | 'fa'} Locale
 * @typedef {'KNOWN' | 'MAPPED' | 'CUSTOM'} MatchType
 * @typedef {{
 *   matchType: MatchType;
 *   serviceId?: string;
 *   confidence: number;
 *   reason: string;
 *   customServiceDraft?: {
 *     name: string;
 *     groupId?: string;
 *     locale: Locale;
 *   };
 * }} ServiceMatch
 */

const CONFIDENCE_THRESHOLD = 0.72;

/**
 * Calculate confidence score for keyword matching
 * @param {string} text
 * @param {string[]} keywords
 * @returns {number}
 */
function calculateKeywordScore(text, keywords) {
  const normalized = text.toLowerCase();
  let matches = 0;
  let totalWeight = 0;

  for (const keyword of keywords) {
    const weight = keyword.length > 4 ? 1.5 : 1.0; // Longer keywords = higher weight
    totalWeight += weight;

    if (normalized.includes(keyword.toLowerCase())) {
      matches += weight;
    }
  }

  return totalWeight > 0 ? matches / totalWeight : 0;
}

/**
 * Extract potential custom service name from text
 * @param {string} text
 * @param {Locale} locale
 * @returns {string | null}
 */
function extractServiceName(text, locale) {
  const normalized = text.trim();

  // Common service request patterns
  const patterns = {
    en: [
      /(?:need|want|looking\s+for)\s+(?:a\s+)?(.+?)(?:\s+service|\s+help|\s+today|\s+tomorrow|$)/i,
      /(?:can\s+you\s+help\s+with|help\s+me\s+with)\s+(.+?)(?:\s+service|\s+help|$)/i,
    ],
    sv: [
      /(?:behöver|vill\s+ha|söker)\s+(.+?)(?:\s+hjälp|\s+idag|\s+imorgon|$)/i,
    ],
    de: [
      /(?:brauche|suche|möchte)\s+(.+?)(?:\s+hilfe|\s+heute|\s+morgen|$)/i,
    ],
    es: [
      /(?:necesito|quiero|busco)\s+(.+?)(?:\s+ayuda|\s+hoy|\s+mañana|$)/i,
    ],
    fa: [
      /(?:نیاز|می‌خواهم|دنبال)\s+(.+?)(?:\s+کمک|$)/i,
    ],
  };

  const localePatterns = patterns[locale] || patterns.en;
  for (const pattern of localePatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Resolve service from user message
 * @param {string} message
 * @param {Locale} locale
 * @param {string} [detectedCategory] - Category hint from NLP
 * @returns {ServiceMatch}
 */
export function resolveService(message, locale, detectedCategory) {
  const normalized = message.toLowerCase();

  // Step 1: Check if NLP already found a known category
  if (detectedCategory) {
    const service = getServiceById(detectedCategory);
    if (service) {
      return {
        matchType: 'KNOWN',
        serviceId: detectedCategory,
        confidence: 0.95,
        reason: `NLP detected category: ${detectedCategory}`,
      };
    }
  }

  // Step 2: Search through catalog with keyword matching
  let bestMatch = null;
  let bestScore = 0;

  for (const service of SERVICE_CATALOG) {
    const keywords = service.keywords[locale] || service.keywords.en;
    const score = calculateKeywordScore(normalized, keywords);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = service;
    }
  }

  // Step 3: Decide KNOWN vs MAPPED vs CUSTOM
  if (bestScore >= CONFIDENCE_THRESHOLD) {
    return {
      matchType: 'KNOWN',
      serviceId: bestMatch.id,
      confidence: bestScore,
      reason: `High confidence match: ${bestMatch.labels[locale] || bestMatch.labels.en}`,
    };
  }

  if (bestScore >= 0.4 && bestScore < CONFIDENCE_THRESHOLD) {
    return {
      matchType: 'MAPPED',
      serviceId: bestMatch.id,
      confidence: bestScore,
      reason: `Partial match to ${bestMatch.labels[locale] || bestMatch.labels.en}, suggest confirmation`,
    };
  }

  // Step 4: Create CUSTOM service draft
  const customName = extractServiceName(message, locale) || message.substring(0, 50);

  return {
    matchType: 'CUSTOM',
    confidence: 0.0,
    reason: 'No known service match, creating custom service',
    customServiceDraft: {
      name: customName,
      locale,
    },
  };
}

/**
 * Suggest group for custom service based on keywords
 * @param {string} serviceName
 * @param {Locale} locale
 * @returns {string | undefined}
 */
export function suggestGroupForCustomService(serviceName, locale) {
  const groupKeywords = {
    'move-deliver': ['move', 'deliver', 'transport', 'carry', 'flytt', 'leverans', 'umzug', 'mudanza', 'اسباب‌کشی'],
    'home-help': ['home', 'house', 'indoor', 'install', 'fix', 'hem', 'haus', 'casa', 'خانه'],
    'outdoor': ['outdoor', 'garden', 'yard', 'utomhus', 'draußen', 'exterior', 'بیرون'],
    'errands': ['buy', 'shop', 'errand', 'köpa', 'kaufen', 'comprar', 'خرید'],
  };

  const normalized = serviceName.toLowerCase();
  let bestGroup = undefined;
  let bestMatches = 0;

  for (const [groupId, keywords] of Object.entries(groupKeywords)) {
    let matches = 0;
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        matches++;
      }
    }
    if (matches > bestMatches) {
      bestMatches = matches;
      bestGroup = groupId;
    }
  }

  return bestGroup || 'home-help'; // Default to home-help
}
