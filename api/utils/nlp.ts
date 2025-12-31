// Simplified NLP for serverless API (no imports from src/)
type Locale = 'en' | 'sv' | 'de' | 'es' | 'fa';
type IntentType = 'BOOK_SERVICE' | 'PROVIDER_SIGNUP' | 'GENERAL_QA' | 'UNKNOWN';

interface NLPEntity {
  location?: string;
  timing?: string;
  budget?: string;
  hours?: number;
  items?: number;
  rooms?: number;
}

interface NLPResult {
  detectedLanguage: Locale;
  intent: IntentType;
  category?: string;
  entities: NLPEntity;
}

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

// Language detection
function detectLanguage(text: string): Locale {
  const normalized = text.toLowerCase();

  if (/[\u0600-\u06FF]/.test(text)) return 'fa';
  if (/\b(jag|är|behöver|vill|kan|städning|hjälp|flyttning)\b/.test(normalized)) return 'sv';
  if (/\b(ich|bin|brauche|will|kann|reinigung|hilfe|umzug)\b/.test(normalized)) return 'de';
  if (/\b(necesito|soy|quiero|puedo|limpieza|ayuda|mudanza)\b/.test(normalized)) return 'es';

  return 'en';
}

// Intent classification
const intentKeywords: Record<Locale, Record<string, string[]>> = {
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
    BOOK_SERVICE: ['نیاز', 'می‌خواهم', 'کمک', 'رزرو', 'نظافت'],
    PROVIDER_SIGNUP: ['همکار شدن', 'ثبت‌نام', 'ارائه خدمات'],
    GENERAL_QA: ['چگونه', 'چه', 'چرا', 'کی', 'قیمت'],
  },
};

function classifyIntent(text: string, locale: Locale): IntentType {
  const normalized = text.toLowerCase();
  const keywords = intentKeywords[locale] || intentKeywords.en;

  for (const [intent, words] of Object.entries(keywords)) {
    if (words.some(word => normalized.includes(word.toLowerCase()))) {
      return intent as IntentType;
    }
  }

  return 'UNKNOWN';
}

// Category matching
const categoryKeywords: Record<Locale, Record<string, string[]>> = {
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

function matchCategory(text: string, locale: Locale): string | undefined {
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
function extractEntities(text: string): NLPEntity {
  const normalized = text.toLowerCase();
  const entities: NLPEntity = {};

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

export function analyzeMessage(text: string, userLocale?: string): NLPResult {
  const detectedLanguage = detectLanguage(text);
  const effectiveLocale = (detectedLanguage !== 'en' ? detectedLanguage : (userLocale as Locale || 'en'));

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
