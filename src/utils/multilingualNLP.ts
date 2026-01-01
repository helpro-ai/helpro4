import { Locale } from '../i18n';
import { IntentType, NLPResult, NLPEntity } from '../types/nlp';

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
] as const;

// Language detection heuristics
export function detectLanguage(text: string): Locale {
  const normalized = text.toLowerCase();

  // Persian/Farsi detection (Unicode range)
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'fa';
  }

  // Swedish indicators
  if (/\b(jag|är|behöver|vill|kan|städning|hjälp|flyttning)\b/.test(normalized)) {
    return 'sv';
  }

  // German indicators
  if (/\b(ich|bin|brauche|will|kann|reinigung|hilfe|umzug)\b/.test(normalized)) {
    return 'de';
  }

  // Spanish indicators
  if (/\b(necesito|soy|quiero|puedo|limpieza|ayuda|mudanza)\b/.test(normalized)) {
    return 'es';
  }

  // Default to English
  return 'en';
}

// Intent classification keywords (multilingual)
const intentKeywords: Record<Locale, Record<IntentType, string[]>> = {
  en: {
    BOOK_SERVICE: ['need', 'want', 'looking for', 'help with', 'book', 'hire', 'cleaning', 'moving', 'delivery', 'assembly', 'repair'],
    PROVIDER_SIGNUP: ['become helper', 'sign up as', 'offer services', 'join as', 'work as', 'provide service'],
    GENERAL_QA: ['how', 'what', 'why', 'when', 'pricing', 'price', 'cost', 'payment', 'faq', 'question'],
    UNKNOWN: [],
  },
  sv: {
    BOOK_SERVICE: ['behöver', 'vill', 'söker', 'hjälp med', 'boka', 'hyra', 'städning', 'flyttning', 'leverans'],
    PROVIDER_SIGNUP: ['bli hjälpare', 'registrera som', 'erbjuda tjänster', 'arbeta som'],
    GENERAL_QA: ['hur', 'vad', 'varför', 'när', 'pris', 'kostnad', 'betalning', 'fråga'],
    UNKNOWN: [],
  },
  de: {
    BOOK_SERVICE: ['brauche', 'will', 'suche', 'hilfe mit', 'buchen', 'mieten', 'reinigung', 'umzug', 'lieferung'],
    PROVIDER_SIGNUP: ['helfer werden', 'anmelden als', 'dienstleistungen anbieten', 'arbeiten als'],
    GENERAL_QA: ['wie', 'was', 'warum', 'wann', 'preis', 'kosten', 'zahlung', 'frage'],
    UNKNOWN: [],
  },
  es: {
    BOOK_SERVICE: ['necesito', 'quiero', 'busco', 'ayuda con', 'reservar', 'contratar', 'limpieza', 'mudanza', 'entrega'],
    PROVIDER_SIGNUP: ['convertirme en ayudante', 'registrarme como', 'ofrecer servicios', 'trabajar como'],
    GENERAL_QA: ['cómo', 'qué', 'por qué', 'cuándo', 'precio', 'costo', 'pago', 'pregunta'],
    UNKNOWN: [],
  },
  fa: {
    BOOK_SERVICE: ['نیاز', 'می‌خواهم', 'کمک', 'رزرو', 'استخدام', 'نظافت', 'اسباب‌کشی', 'تحویل'],
    PROVIDER_SIGNUP: ['همکار شدن', 'ثبت‌نام', 'ارائه خدمات', 'کار کردن'],
    GENERAL_QA: ['چگونه', 'چه', 'چرا', 'کی', 'قیمت', 'هزینه', 'پرداخت', 'سوال'],
    UNKNOWN: [],
  },
};

// Category matching keywords (multilingual)
const categoryKeywords: Record<Locale, Record<string, string[]>> = {
  en: {
    'moving-delivery': ['moving', 'move', 'delivery', 'transport', 'van', 'truck', 'relocate', 'pickup'],
    'remove-recycle': ['remove', 'disposal', 'junk', 'recycle', 'trash', 'waste', 'cleanout'],
    'buy-for-me': ['buy', 'shopping', 'groceries', 'errands', 'pickup', 'collect'],
    'assembly': ['assembly', 'assemble', 'furniture', 'ikea', 'flat-pack'],
    'mounting': ['mount', 'install', 'hang', 'tv', 'shelf', 'curtain'],
    'cleaning': ['clean', 'cleaning', 'tidy', 'scrub', 'vacuum', 'mop', 'dusting'],
    'yard': ['yard', 'garden', 'lawn', 'mowing', 'leaves', 'outdoor', 'snow'],
    'repairs': ['repair', 'fix', 'broken', 'handyman', 'patch'],
    'painting': ['paint', 'painting', 'touch-up', 'wall'],
  },
  sv: {
    'moving-delivery': ['flytt', 'flyttning', 'leverans', 'transport', 'skåpbil', 'lastbil'],
    'remove-recycle': ['bortforsling', 'återvinning', 'skräp', 'sopor', 'avfall'],
    'buy-for-me': ['köpa', 'shopping', 'matvaror', 'ärenden', 'hämta'],
    'assembly': ['montering', 'montera', 'möbel', 'ikea'],
    'mounting': ['montera', 'installera', 'hänga', 'tv', 'hylla'],
    'cleaning': ['städ', 'städning', 'rengöring', 'snygga', 'dammsuga'],
    'yard': ['trädgård', 'gräsmatta', 'klippa', 'löv', 'snö'],
    'repairs': ['reparation', 'fixa', 'laga', 'hantverkare'],
    'painting': ['målning', 'måla', 'vägg'],
  },
  de: {
    'moving-delivery': ['umzug', 'umziehen', 'lieferung', 'transport', 'transporter'],
    'remove-recycle': ['entsorgung', 'recycling', 'müll', 'abfall', 'entrümpelung'],
    'buy-for-me': ['einkaufen', 'shopping', 'lebensmittel', 'besorgungen', 'abholen'],
    'assembly': ['montage', 'montieren', 'möbel', 'ikea'],
    'mounting': ['montieren', 'installieren', 'aufhängen', 'tv', 'regal'],
    'cleaning': ['reinigung', 'putzen', 'sauber', 'saugen'],
    'yard': ['garten', 'rasen', 'mähen', 'laub', 'schnee'],
    'repairs': ['reparatur', 'reparieren', 'handwerker'],
    'painting': ['malen', 'streichen', 'wand'],
  },
  es: {
    'moving-delivery': ['mudanza', 'mudar', 'entrega', 'transporte', 'furgoneta'],
    'remove-recycle': ['eliminación', 'reciclaje', 'basura', 'desechos'],
    'buy-for-me': ['comprar', 'compras', 'comestibles', 'recados', 'recoger'],
    'assembly': ['montaje', 'montar', 'muebles', 'ikea'],
    'mounting': ['montar', 'instalar', 'colgar', 'tv', 'estante'],
    'cleaning': ['limpieza', 'limpiar', 'ordenar', 'aspirar'],
    'yard': ['jardín', 'césped', 'cortar', 'hojas', 'nieve'],
    'repairs': ['reparación', 'reparar', 'arreglar'],
    'painting': ['pintura', 'pintar', 'pared'],
  },
  fa: {
    'moving-delivery': ['اسباب‌کشی', 'حمل', 'تحویل', 'حمل‌ونقل'],
    'remove-recycle': ['جمع‌آوری', 'بازیافت', 'زباله', 'ضایعات'],
    'buy-for-me': ['خرید', 'خریدکردن', 'مواد‌غذایی'],
    'assembly': ['مونتاژ', 'سوار کردن', 'مبل'],
    'mounting': ['نصب', 'آویزان کردن', 'تلویزیون', 'قفسه'],
    'cleaning': ['نظافت', 'تمیزکردن', 'مرتب کردن'],
    'yard': ['باغچه', 'چمن', 'چمن‌زنی'],
    'repairs': ['تعمیر', 'تعمیرات', 'درست کردن'],
    'painting': ['نقاشی', 'رنگ‌آمیزی', 'دیوار'],
  },
};

export function classifyIntent(text: string, locale: Locale): IntentType {
  const normalized = text.toLowerCase();
  const keywords = intentKeywords[locale] || intentKeywords.en;

  for (const [intent, words] of Object.entries(keywords)) {
    if (intent === 'UNKNOWN') continue;
    if (words.some(word => normalized.includes(word.toLowerCase()))) {
      return intent as IntentType;
    }
  }

  return 'UNKNOWN';
}

export function matchCategory(text: string, locale: Locale): string | undefined {
  const normalized = text.toLowerCase();
  const keywords = categoryKeywords[locale] || categoryKeywords.en;

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => normalized.includes(word.toLowerCase()))) {
      if (VALID_CATEGORIES.includes(category as any)) {
        return category;
      }
    }
  }

  return undefined;
}

export function extractEntities(text: string, locale: Locale): NLPEntity {
  const normalized = text.toLowerCase();
  const entities: NLPEntity = {};

  // Extract numbers for hours/items/rooms
  const hourMatch = normalized.match(/(\d+)\s*(hour|hr|hours|hrs|timme|timmar|stunde|stunden|hora|horas|ساعت)/);
  if (hourMatch) {
    entities.hours = parseInt(hourMatch[1], 10);
  }

  const roomMatch = normalized.match(/(\d+)\s*(room|rooms|bed|beds|rum|zimmer|habitación|habitaciones|اتاق)/);
  if (roomMatch) {
    entities.rooms = parseInt(roomMatch[1], 10);
  }

  const itemMatch = normalized.match(/(\d+)\s*(item|items|thing|things|sak|saker|artikel|cosa|cosas|چیز)/);
  if (itemMatch) {
    entities.items = parseInt(itemMatch[1], 10);
  }

  // Extract location (basic city names - expandable)
  const locationPatterns: Record<Locale, RegExp> = {
    en: /\b(stockholm|göteborg|malmö|gothenburg|berlin|munich|madrid|barcelona|paris|london)\b/i,
    sv: /\b(stockholm|göteborg|malmö|uppsala|västerås)\b/i,
    de: /\b(berlin|münchen|hamburg|köln|frankfurt)\b/i,
    es: /\b(madrid|barcelona|valencia|sevilla|zaragoza)\b/i,
    fa: /\b(استکهلم|گوتنبرگ|مالمو)\b/i,
  };
  const locationMatch = text.match(locationPatterns[locale] || locationPatterns.en);
  if (locationMatch) {
    entities.location = locationMatch[1];
  }

  // Extract timing
  const timingPatterns: Record<Locale, string[]> = {
    en: ['today', 'tomorrow', 'this week', 'next week', 'weekend', 'monday', 'tuesday'],
    sv: ['idag', 'imorgon', 'denna vecka', 'nästa vecka', 'helgen'],
    de: ['heute', 'morgen', 'diese woche', 'nächste woche', 'wochenende'],
    es: ['hoy', 'mañana', 'esta semana', 'próxima semana', 'fin de semana'],
    fa: ['امروز', 'فردا', 'این هفته', 'هفته آینده'],
  };
  const timings = timingPatterns[locale] || timingPatterns.en;
  for (const timing of timings) {
    if (normalized.includes(timing)) {
      entities.timing = timing;
      break;
    }
  }

  // Extract budget (basic currency patterns)
  const budgetMatch = text.match(/(\d+)\s*(kr|sek|€|eur|€|usd|\$|تومان)/i);
  if (budgetMatch) {
    entities.budget = `${budgetMatch[1]} ${budgetMatch[2]}`;
  }

  return entities;
}

export function analyzeMessage(text: string, userLocale?: Locale): NLPResult {
  // Detect language
  const detectedLanguage = detectLanguage(text);

  // Use detected language or fall back to user's UI locale or English
  const effectiveLocale = detectedLanguage !== 'en' ? detectedLanguage : (userLocale || 'en');

  // Classify intent
  const intent = classifyIntent(text, effectiveLocale);

  // Match category (only if intent is BOOK_SERVICE)
  const category = intent === 'BOOK_SERVICE' ? matchCategory(text, effectiveLocale) : undefined;

  // Extract entities
  const entities = extractEntities(text, effectiveLocale);

  return {
    detectedLanguage: effectiveLocale,
    intent,
    category,
    entities,
  };
}
