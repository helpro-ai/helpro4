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
    BOOK_SERVICE: ['need', 'want', 'looking for', 'help with', 'book', 'hire', 'cleaning', 'moving', 'mount', 'mounting', 'assemble', 'assembly', 'become a helper'],
    PROVIDER_SIGNUP: ['become helper', 'sign up as', 'offer services', 'work as', 'i want to become'],
    GENERAL_QA: ['how', 'what', 'why', 'when', 'pricing', 'price', 'cost', 'do you have', 'does it'],
  },
  sv: {
    BOOK_SERVICE: ['behöver', 'vill', 'vill ha', 'skulle vilja', 'söker', 'hjälp med', 'boka', 'städning', 'städa', 'flytt', 'flyttning', 'kan ni', 'skulle ni kunna', 'montering', 'montera', 'looking for', 'need help'],
    PROVIDER_SIGNUP: ['bli hjälpare', 'registrera som', 'erbjuda tjänster', 'jobba som'],
    GENERAL_QA: ['hur fungerar', 'hur mycket', 'vad kostar', 'varför', 'när', 'pris', 'kostar'],
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
    BOOK_SERVICE: ['نیاز', 'می خواهم', 'میخواهم', 'میخوام', 'رزرو', 'نظافت', 'خدمت', 'اسباب کشی', 'اسباب‌کشی', 'حمل', 'بیا', 'بیایید'],
    PROVIDER_SIGNUP: ['همکار شدن', 'ثبت نام کنم', 'ثبت‌نام کنم', 'ثبت نام', 'نام نویسی', 'ارائه خدمات', 'کار کردن', 'کار می کنم'],
    GENERAL_QA: ['چگونه', 'چطور', 'چطوری', 'چه طور', 'چی هست', 'چیه', 'چرا', 'قیمت چقدر', 'چقدر است', 'چقدره', 'پرداخت چطور', 'واریز', 'تسویه', 'کارمزد', 'لغو', 'کنسل', 'بازگشت وجه', 'ریفاند', 'بیمه دارید', 'بیمه دارد', 'امنیت', 'اعتبار'],
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

  // Check PROVIDER_SIGNUP first (higher priority to avoid false BOOK_SERVICE matches)
  if (keywords.PROVIDER_SIGNUP && keywords.PROVIDER_SIGNUP.some(word => normalized.includes(normalizeText(word)))) {
    return 'PROVIDER_SIGNUP';
  }

  // Check GENERAL_QA second (must come before category check to avoid single-word ambiguity)
  if (keywords.GENERAL_QA && keywords.GENERAL_QA.some(word => normalized.includes(normalizeText(word)))) {
    return 'GENERAL_QA';
  }

  // Check BOOK_SERVICE (intent keywords)
  if (keywords.BOOK_SERVICE && keywords.BOOK_SERVICE.some(word => normalized.includes(normalizeText(word)))) {
    return 'BOOK_SERVICE';
  }

  // NEW: Check if message is a single-word service category (e.g. "cleaning", "نظافت", "städning")
  // This handles cases where user just types the service name without context
  const categoryHints = categoryKeywords[locale] || categoryKeywords.en;
  for (const categoryWords of Object.values(categoryHints)) {
    if (categoryWords.some(word => normalizeText(word) === normalized)) {
      return 'BOOK_SERVICE'; // Single-word service name = implicit booking intent
    }
  }

  // Fallback: Check English keywords for any locale (handles English suggestion values)
  if (locale !== 'en') {
    const enKeywords = intentKeywords.en;

    if (enKeywords.PROVIDER_SIGNUP && enKeywords.PROVIDER_SIGNUP.some(word => normalized.includes(word.toLowerCase()))) {
      return 'PROVIDER_SIGNUP';
    }

    if (enKeywords.GENERAL_QA && enKeywords.GENERAL_QA.some(word => normalized.includes(word.toLowerCase()))) {
      return 'GENERAL_QA';
    }

    if (enKeywords.BOOK_SERVICE && enKeywords.BOOK_SERVICE.some(word => normalized.includes(word.toLowerCase()))) {
      return 'BOOK_SERVICE';
    }
  }

  return 'UNKNOWN';
}

// Category matching
/** @type {Record<Locale, Record<string, string[]>>} */
const categoryKeywords = {
  en: {
    'moving-delivery': ['moving', 'move', 'delivery', 'transport', 'van', 'truck', 'relocate'],
    'remove-recycle': ['remove', 'disposal', 'junk', 'recycle', 'trash'],
    'buy-for-me': ['buy', 'shopping', 'groceries', 'errands'],
    assembly: ['assembly', 'assemble', 'furniture', 'ikea', 'flat pack'],
    mounting: ['mount', 'mounting', 'install', 'hang', 'tv', 'shelf', 'wall'],
    cleaning: ['clean', 'cleaning', 'tidy', 'scrub', 'vacuum', 'städa'],
    yard: ['yard', 'garden', 'lawn', 'mowing', 'leaves'],
    repairs: ['repair', 'fix', 'broken', 'handyman'],
    painting: ['paint', 'painting', 'touch-up'],
  },
  sv: {
    'moving-delivery': ['flytt', 'flyttning', 'leverans', 'transport', 'moving'],
    'remove-recycle': ['bortforsling', 'återvinning', 'skräp'],
    'buy-for-me': ['köpa', 'shopping', 'matvaror'],
    assembly: ['montering', 'montera', 'möbel', 'ikea', 'assembly'],
    mounting: ['montera', 'installera', 'hänga', 'tv', 'mounting'],
    cleaning: ['städ', 'städning', 'städa', 'rengöring'],
    yard: ['trädgård', 'gräsmatta', 'klippa'],
    repairs: ['reparation', 'fixa', 'laga', 'hantverkare'],
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
    'moving-delivery': ['اسباب‌کشی', 'اسباب کشی', 'حمل', 'تحویل', 'ترابری'],
    'remove-recycle': ['جمع‌آوری', 'بازیافت', 'زباله'],
    'buy-for-me': ['خرید', 'خریدکردن', 'مواد‌غذایی'],
    assembly: ['مونتاژ', 'سوار کردن', 'مبل'],
    mounting: ['نصب', 'آویزان کردن', 'تلویزیون', 'راه اندازی'],
    cleaning: ['نظافت', 'تمیزکردن', 'تمیز', 'خانه تکانی'],
    yard: ['باغچه', 'چمن'],
    repairs: ['تعمیر', 'تعمیرات', 'درست کردن'],
    painting: ['نقاشی', 'رنگ‌آمیزی', 'رنگ'],
  },
};

/**
 * @param {string} text
 * @param {Locale} locale
 * @returns {string | undefined}
 */
function matchCategory(text, locale) {
  const normalized = normalizeText(text);
  const keywords = categoryKeywords[locale] || categoryKeywords.en;

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => normalized.includes(normalizeText(word)))) {
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

  // Convert Persian/Arabic digits to Western digits for consistent matching
  const normalizedDigits = text.replace(/[۰-۹]/g, d => {
    const index = '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
    return index >= 0 ? String(index) : d;
  });

  // Hours: support Western and Persian digits
  const hourMatch = normalizedDigits.match(/([0-9۰-۹]+)\s*(hour|hr|hours|hrs|timme|timmar|stunde|hora|ساعت)/i);
  if (hourMatch) {
    const digitStr = hourMatch[1].replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
    entities.hours = parseInt(digitStr, 10);
  }

  // Rooms: support Western and Persian digits
  const roomMatch = normalizedDigits.match(/([0-9۰-۹]+)\s*(room|rooms|bed|bedroom|rum|zimmer|habitación|اتاق|اطاق)/i);
  if (roomMatch) {
    const digitStr = roomMatch[1].replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
    entities.rooms = parseInt(digitStr, 10);
  }

  // Items: support Western and Persian digits
  const itemMatch = normalizedDigits.match(/([0-9۰-۹]+)\s*(item|items|sak|artikel|cosa|چیز|مورد)/i);
  if (itemMatch) {
    const digitStr = itemMatch[1].replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
    entities.items = parseInt(digitStr, 10);
  }

  // Location: support common Swedish cities + Persian spellings
  // Note: \b doesn't work well with Persian, so use lookahead/lookbehind or simple match
  const locationMatch = text.match(/(stockholm|göteborg|malmö|södertälje|uppsala|västerås|örebro|linköping|berlin|madrid|barcelona|paris|london|استکهلم|استوکهلم|گوتبورگ|مالمو)/i);
  if (locationMatch) entities.location = locationMatch[1];

  // Timing: support Swedish time phrases (idag, imorgon, helgen, kväll, morgon) + Persian
  // Note: \b doesn't work well with Persian, so use lookahead/lookbehind or simple match
  // Improved: handle Swedish colloquial spacing variations
  const timingMatch = text.match(/(today|tomorrow|tonight|this\s+week|weekend|idag|i\s*dag|imorgon|i\s*morgon|i\s+morgon|helgen|i\s*helgen|i\s+helgen|kväll|kvällen|ikväll|i\s*kväll|morgon|morgonen|imorgon\s*bitti|heute|morgen|hoy|mañana|امروز|فردا|عصر|صبح|شب|هفته)/i);
  if (timingMatch) entities.timing = timingMatch[1].replace(/\s+/g, ' ').trim();

  // Budget: support SEK, EUR, USD, Toman
  const budgetMatch = text.match(/([0-9۰-۹]+)\s*(kr|sek|€|eur|\$|usd|تومان|کرون)/i);
  if (budgetMatch) {
    const digitStr = budgetMatch[1].replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
    entities.budget = `${digitStr} ${budgetMatch[2]}`;
  }

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
