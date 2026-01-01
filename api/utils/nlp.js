// Simplified NLP for serverless API (no imports from src/)
// @ts-check

/**
 * @typedef {'en' | 'sv' | 'de' | 'es' | 'fa'} Locale
 * @typedef {'BOOK_SERVICE' | 'PROVIDER_SIGNUP' | 'GENERAL_QA' | 'UNKNOWN'} IntentType
 * @typedef {{
 *   location?: string;
 *   timing?: string;
 *   budget?: string;
 *   hours?: number;
 *   items?: number;
 *   rooms?: number;
 * }} NLPEntity
 * @typedef {{
 *   detectedLanguage: Locale;
 *   intent: IntentType;
 *   category?: string;
 *   entities: NLPEntity;
 * }} NLPResult
 */

// Valid category IDs from catalog.ts
const VALID_CATEGORIES = [
  'moving-delivery',
  'remove-recycle',
  'buy-for-me',
  'assembly',
  'mounting',
  'cleaning',
  'yard',
  'repairs',
  'painting',
];

// Language detection with greeting support
/**
 * @param {string} text
 * @returns {Locale}
 */
function detectLanguage(text) {
  const normalized = text.toLowerCase().trim();

  // Persian/Arabic script detection (highest priority)
  if (/[\u0600-\u06FF]/.test(text)) return 'fa';

  // Swedish greetings + keywords
  if (/\b(hej|tjena|hallå|god\s+morgon|god\s+kväll|godmorgon|godkväll)\b/.test(normalized)) return 'sv';
  if (/\b(jag|är|behöver|vill|kan|städning|hjälp|flyttning|imorgon|idag)\b/.test(normalized)) return 'sv';

  // German greetings + keywords
  if (/\b(hallo|guten\s+tag|guten\s+morgen|guten\s+abend)\b/.test(normalized)) return 'de';
  if (/\b(ich|bin|brauche|will|kann|reinigung|hilfe|umzug|heute|morgen)\b/.test(normalized)) return 'de';

  // Spanish greetings + keywords
  if (/\b(hola|buenos\s+días|buenas\s+tardes|buenas\s+noches)\b/.test(normalized)) return 'es';
  if (/\b(necesito|soy|quiero|puedo|limpieza|ayuda|mudanza|hoy|mañana)\b/.test(normalized)) return 'es';

  // English is default
  return 'en';
}

// Intent classification
/** @type {Record<Locale, Record<string, string[]>>} */
const intentKeywords = {
  en: {
    BOOK_SERVICE: ['need', 'want', 'looking for', 'help with', 'book', 'hire', 'cleaning', 'moving'],
    PROVIDER_SIGNUP: ['become helper', 'sign up as', 'offer services', 'work as'],
    GENERAL_QA: ['how', 'what', 'why', 'when', 'pricing', 'price', 'cost'],
  },
  sv: {
    BOOK_SERVICE: ['behöver', 'vill', 'söker', 'hjälp med', 'boka', 'städning'],
    PROVIDER_SIGNUP: ['bli hjälpare', 'registrera som', 'erbjuda tjänster'],
    GENERAL_QA: ['hur', 'vad', 'varför', 'när', 'pris'],
  },
  de: {
    BOOK_SERVICE: ['brauche', 'will', 'suche', 'hilfe mit', 'buchen', 'reinigung'],
    PROVIDER_SIGNUP: ['helfer werden', 'anmelden als', 'dienstleistungen anbieten'],
    GENERAL_QA: ['wie', 'was', 'warum', 'wann', 'preis'],
  },
  es: {
    BOOK_SERVICE: ['necesito', 'quiero', 'busco', 'ayuda con', 'reservar', 'limpieza'],
    PROVIDER_SIGNUP: ['convertirme en ayudante', 'registrarme como', 'ofrecer servicios'],
    GENERAL_QA: ['cómo', 'qué', 'por qué', 'cuándo', 'precio'],
  },
  fa: {
    BOOK_SERVICE: ['نیاز', 'می خواهم', 'کمک', 'رزرو', 'نظافت', 'خدمت'],
    PROVIDER_SIGNUP: ['همکار شدن', 'ثبت نام', 'نام نویسی', 'ارائه خدمات'],
    GENERAL_QA: ['چگونه', 'چطور', 'چه طور', 'چی', 'چیه', 'چه', 'چرا', 'کی', 'کجا', 'چند', 'قیمت', 'پرداخت', 'واریز', 'تسویه', 'پول', 'هزینه', 'کارمزد', 'لغو', 'کنسل', 'بازگشت پول', 'ریفاند', 'بیمه', 'امنیت', 'تایید', 'اعتبار', 'زمان', 'چقدر', 'دریافت پول'],
  },
};

/**
 * Normalize text for Persian/Arabic matching
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  // NFKC normalization
  let normalized = text.normalize('NFKC');

  // Replace ZWNJ (Zero-Width Non-Joiner) with space
  normalized = normalized.replace(/\u200c/g, ' ');

  // Map Arabic characters to Persian equivalents
  normalized = normalized.replace(/ك/g, 'ک'); // Arabic kaf -> Persian kaf
  normalized = normalized.replace(/ي/g, 'ی'); // Arabic yeh -> Persian yeh

  // Remove/space punctuation including question marks (both ? and ؟)
  normalized = normalized.replace(/[?؟!.,;:\-()]/g, ' ');

  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized.toLowerCase();
}

/**
 * @param {string} text
 * @param {Locale} locale
 * @returns {IntentType}
 */
function classifyIntent(text, locale) {
  const normalized = normalizeText(text);
  const keywords = intentKeywords[locale] || intentKeywords.en;

  // Check locale-specific keywords
  for (const [intent, words] of Object.entries(keywords)) {
    if (words.some(word => normalized.includes(normalizeText(word)))) {
      return /** @type {IntentType} */ (intent);
    }
  }

  // Fallback: Check English keywords for any locale (handles English suggestion values)
  if (locale !== 'en') {
    const enKeywords = intentKeywords.en;
    for (const [intent, words] of Object.entries(enKeywords)) {
      if (words.some(word => normalized.includes(word.toLowerCase()))) {
        return /** @type {IntentType} */ (intent);
      }
    }
  }

  return 'UNKNOWN';
}

// Category matching
/** @type {Record<Locale, Record<string, string[]>>} */
const categoryKeywords = {
  en: {
    'moving-delivery': ['moving', 'move', 'delivery', 'transport', 'van', 'truck'],
    'remove-recycle': ['remove', 'disposal', 'junk', 'recycle', 'trash'],
    'buy-for-me': ['buy', 'shopping', 'groceries', 'errands'],
    assembly: ['assembly', 'assemble', 'furniture', 'ikea'],
    mounting: ['mount', 'install', 'hang', 'tv', 'shelf'],
    cleaning: ['clean', 'cleaning', 'tidy', 'scrub', 'vacuum'],
    yard: ['yard', 'garden', 'lawn', 'mowing', 'leaves'],
    repairs: ['repair', 'fix', 'broken', 'handyman'],
    painting: ['paint', 'painting', 'touch-up'],
  },
  sv: {
    'moving-delivery': ['flytt', 'flyttning', 'leverans', 'transport'],
    'remove-recycle': ['bortforsling', 'återvinning', 'skräp'],
    'buy-for-me': ['köpa', 'shopping', 'matvaror'],
    assembly: ['montering', 'montera', 'möbel'],
    mounting: ['montera', 'installera', 'hänga', 'tv'],
    cleaning: ['städ', 'städning', 'rengöring'],
    yard: ['trädgård', 'gräsmatta', 'klippa'],
    repairs: ['reparation', 'fixa', 'laga'],
    painting: ['målning', 'måla'],
  },
  de: {
    'moving-delivery': ['umzug', 'umziehen', 'lieferung'],
    'remove-recycle': ['entsorgung', 'recycling', 'müll'],
    'buy-for-me': ['einkaufen', 'shopping', 'lebensmittel'],
    assembly: ['montage', 'montieren', 'möbel'],
    mounting: ['montieren', 'installieren', 'aufhängen'],
    cleaning: ['reinigung', 'putzen', 'sauber'],
    yard: ['garten', 'rasen', 'mähen'],
    repairs: ['reparatur', 'reparieren'],
    painting: ['malen', 'streichen'],
  },
  es: {
    'moving-delivery': ['mudanza', 'mudar', 'entrega'],
    'remove-recycle': ['eliminación', 'reciclaje', 'basura'],
    'buy-for-me': ['comprar', 'compras', 'comestibles'],
    assembly: ['montaje', 'montar', 'muebles'],
    mounting: ['montar', 'instalar', 'colgar'],
    cleaning: ['limpieza', 'limpiar', 'ordenar'],
    yard: ['jardín', 'césped', 'cortar'],
    repairs: ['reparación', 'reparar'],
    painting: ['pintura', 'pintar'],
  },
  fa: {
    'moving-delivery': ['اسباب‌کشی', 'حمل', 'تحویل'],
    'remove-recycle': ['جمع‌آوری', 'بازیافت', 'زباله'],
    'buy-for-me': ['خرید', 'خریدکردن', 'مواد‌غذایی'],
    assembly: ['مونتاژ', 'سوار کردن', 'مبل'],
    mounting: ['نصب', 'آویزان کردن', 'تلویزیون'],
    cleaning: ['نظافت', 'تمیزکردن'],
    yard: ['باغچه', 'چمن'],
    repairs: ['تعمیر', 'تعمیرات'],
    painting: ['نقاشی', 'رنگ‌آمیزی'],
  },
};

/**
 * @param {string} text
 * @param {Locale} locale
 * @returns {string | undefined}
 */
function matchCategory(text, locale) {
  const normalized = text.toLowerCase();
  const keywords = categoryKeywords[locale] || categoryKeywords.en;

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => normalized.includes(word.toLowerCase()))) {
      if (VALID_CATEGORIES.includes(category)) {
        return category;
      }
    }
  }

  return undefined;
}

// Entity extraction
/**
 * @param {string} text
 * @returns {NLPEntity}
 */
function extractEntities(text) {
  const normalized = text.toLowerCase();
  /** @type {NLPEntity} */
  const entities = {};

  const hourMatch = normalized.match(/(\d+)\s*(hour|hr|hours|hrs|timme|stunde|hora|ساعت)/);
  if (hourMatch) entities.hours = parseInt(hourMatch[1], 10);

  const roomMatch = normalized.match(/(\d+)\s*(room|rooms|bed|rum|zimmer|habitación|اتاق)/);
  if (roomMatch) entities.rooms = parseInt(roomMatch[1], 10);

  const itemMatch = normalized.match(/(\d+)\s*(item|items|sak|artikel|cosa|چیز)/);
  if (itemMatch) entities.items = parseInt(itemMatch[1], 10);

  const locationMatch = text.match(/\b(stockholm|göteborg|malmö|berlin|madrid|barcelona|paris|london|استکهلم)\b/i);
  if (locationMatch) entities.location = locationMatch[1];

  const timingMatch = normalized.match(/\b(today|tomorrow|idag|imorgon|heute|morgen|hoy|mañana|امروز|فردا)\b/);
  if (timingMatch) entities.timing = timingMatch[1];

  const budgetMatch = text.match(/(\d+)\s*(kr|sek|€|eur|\$|تومان)/i);
  if (budgetMatch) entities.budget = `${budgetMatch[1]} ${budgetMatch[2]}`;

  return entities;
}

/**
 * @param {string} text
 * @param {string} [userLocale]
 * @returns {NLPResult}
 */
export function analyzeMessage(text, userLocale) {
  const detectedLanguage = detectLanguage(text);
  const effectiveLocale = (detectedLanguage !== 'en' ? detectedLanguage : (userLocale || 'en'));

  const intent = classifyIntent(text, effectiveLocale);
  const category = intent === 'BOOK_SERVICE' ? matchCategory(text, effectiveLocale) : undefined;
  const entities = extractEntities(text);

  return {
    detectedLanguage: effectiveLocale,
    intent,
    category,
    entities,
  };
}
