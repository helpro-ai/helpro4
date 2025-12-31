// Shared reply builder for multilingual chat responses
// Used by both Vercel serverless functions and Express dev server
// @ts-check

/**
 * @typedef {'en' | 'sv' | 'de' | 'es' | 'fa'} Locale
 * @typedef {'BOOK_SERVICE' | 'PROVIDER_SIGNUP' | 'GENERAL_QA' | 'UNKNOWN'} IntentType
 * @typedef {{
 *   detectedLanguage: Locale;
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
 * }} NLPResult
 */

// Multilingual reply templates
/** @type {Record<Locale, Record<IntentType, string>>} */
const REPLIES = {
  en: {
    BOOK_SERVICE: 'I can help you find the right service. What type of help do you need?',
    PROVIDER_SIGNUP: 'Interested in becoming a helper? Great! You can sign up to offer your services.',
    GENERAL_QA: 'I can answer questions about our services, pricing, and how the platform works. What would you like to know?',
    UNKNOWN: 'Hello! I can help you book services or answer questions. What do you need?',
  },
  sv: {
    BOOK_SERVICE: 'Jag kan hjälpa dig hitta rätt tjänst. Vilken typ av hjälp behöver du?',
    PROVIDER_SIGNUP: 'Intresserad av att bli hjälpare? Fantastiskt! Du kan registrera dig för att erbjuda dina tjänster.',
    GENERAL_QA: 'Jag kan svara på frågor om våra tjänster, priser och hur plattformen fungerar. Vad vill du veta?',
    UNKNOWN: 'Hej! Jag kan hjälpa dig boka tjänster eller svara på frågor. Vad behöver du?',
  },
  de: {
    BOOK_SERVICE: 'Ich kann Ihnen helfen, den richtigen Service zu finden. Welche Art von Hilfe benötigen Sie?',
    PROVIDER_SIGNUP: 'Möchten Sie Helfer werden? Großartig! Sie können sich registrieren, um Ihre Dienste anzubieten.',
    GENERAL_QA: 'Ich kann Fragen zu unseren Dienstleistungen, Preisen und zur Funktionsweise der Plattform beantworten. Was möchten Sie wissen?',
    UNKNOWN: 'Hallo! Ich kann Ihnen helfen, Dienste zu buchen oder Fragen zu beantworten. Was brauchen Sie?',
  },
  es: {
    BOOK_SERVICE: 'Puedo ayudarte a encontrar el servicio adecuado. ¿Qué tipo de ayuda necesitas?',
    PROVIDER_SIGNUP: '¿Interesado en convertirte en ayudante? ¡Genial! Puedes registrarte para ofrecer tus servicios.',
    GENERAL_QA: 'Puedo responder preguntas sobre nuestros servicios, precios y cómo funciona la plataforma. ¿Qué te gustaría saber?',
    UNKNOWN: '¡Hola! Puedo ayudarte a reservar servicios o responder preguntas. ¿Qué necesitas?',
  },
  fa: {
    BOOK_SERVICE: 'می‌توانم به شما کمک کنم سرویس مناسب را پیدا کنید. چه نوع کمکی نیاز دارید؟',
    PROVIDER_SIGNUP: 'به همکاری علاقه‌مندید؟ عالی! می‌توانید برای ارائه خدمات خود ثبت‌نام کنید.',
    GENERAL_QA: 'می‌توانم به سؤالات شما درباره خدمات، قیمت‌ها و نحوه کار پلتفرم پاسخ دهم. چه می‌خواهید بدانید؟',
    UNKNOWN: 'سلام! می‌توانم به شما در رزرو خدمات یا پاسخ به سؤالات کمک کنم. چه نیاز دارید؟',
  },
};

// Category-specific templates with entity context
/** @type {Record<Locale, Record<string, string>>} */
const CATEGORY_REPLIES = {
  en: {
    'moving-delivery': 'I understand you need help with moving or delivery.',
    'remove-recycle': 'I can help you find someone for removal or recycling.',
    'buy-for-me': 'I can help you find someone to do shopping or errands.',
    assembly: 'I can help you find someone for furniture assembly.',
    mounting: 'I can help you find someone to mount or install items.',
    cleaning: 'I understand you need cleaning help.',
    yard: 'I can help you find yard or garden services.',
    repairs: 'I can help you find repair or handyman services.',
    painting: 'I can help you find painting services.',
  },
  sv: {
    'moving-delivery': 'Jag förstår att du behöver hjälp med flytt eller leverans.',
    'remove-recycle': 'Jag kan hjälpa dig hitta någon för bortforsling eller återvinning.',
    'buy-for-me': 'Jag kan hjälpa dig hitta någon att handla åt dig.',
    assembly: 'Jag kan hjälpa dig hitta någon för möbelmontering.',
    mounting: 'Jag kan hjälpa dig hitta någon för montering eller installation.',
    cleaning: 'Jag förstår att du behöver städhjälp.',
    yard: 'Jag kan hjälpa dig hitta trädgårdstjänster.',
    repairs: 'Jag kan hjälpa dig hitta reparations- eller hantverkartjänster.',
    painting: 'Jag kan hjälpa dig hitta måltjänster.',
  },
  de: {
    'moving-delivery': 'Ich verstehe, dass Sie Hilfe beim Umzug oder bei der Lieferung benötigen.',
    'remove-recycle': 'Ich kann Ihnen helfen, jemanden für Entsorgung oder Recycling zu finden.',
    'buy-for-me': 'Ich kann Ihnen helfen, jemanden zum Einkaufen zu finden.',
    assembly: 'Ich kann Ihnen helfen, jemanden für die Möbelmontage zu finden.',
    mounting: 'Ich kann Ihnen helfen, jemanden für Montage oder Installation zu finden.',
    cleaning: 'Ich verstehe, dass Sie Reinigungshilfe benötigen.',
    yard: 'Ich kann Ihnen helfen, Garten- oder Rasenpflegedienste zu finden.',
    repairs: 'Ich kann Ihnen helfen, Reparatur- oder Handwerkerdienste zu finden.',
    painting: 'Ich kann Ihnen helfen, Maldienste zu finden.',
  },
  es: {
    'moving-delivery': 'Entiendo que necesitas ayuda con mudanza o entrega.',
    'remove-recycle': 'Puedo ayudarte a encontrar a alguien para eliminación o reciclaje.',
    'buy-for-me': 'Puedo ayudarte a encontrar a alguien para hacer compras.',
    assembly: 'Puedo ayudarte a encontrar a alguien para montar muebles.',
    mounting: 'Puedo ayudarte a encontrar a alguien para montar o instalar.',
    cleaning: 'Entiendo que necesitas ayuda de limpieza.',
    yard: 'Puedo ayudarte a encontrar servicios de jardín.',
    repairs: 'Puedo ayudarte a encontrar servicios de reparación.',
    painting: 'Puedo ayudarte a encontrar servicios de pintura.',
  },
  fa: {
    'moving-delivery': 'می‌فهمم که برای اسباب‌کشی یا تحویل نیاز به کمک دارید.',
    'remove-recycle': 'می‌توانم به شما کمک کنم کسی برای جمع‌آوری یا بازیافت پیدا کنید.',
    'buy-for-me': 'می‌توانم به شما کمک کنم کسی برای خرید پیدا کنید.',
    assembly: 'می‌توانم به شما کمک کنم کسی برای مونتاژ مبلمان پیدا کنید.',
    mounting: 'می‌توانم به شما کمک کنم کسی برای نصب پیدا کنید.',
    cleaning: 'می‌فهمم که به کمک نظافت نیاز دارید.',
    yard: 'می‌توانم به شما کمک کنم خدمات باغبانی پیدا کنید.',
    repairs: 'می‌توانم به شما کمک کنم خدمات تعمیرات پیدا کنید.',
    painting: 'می‌توانم به شما کمک کنم خدمات نقاشی پیدا کنید.',
  },
};

/** @type {Record<Locale, { location: string; timing: string; action: string }>} */
const CONTEXT_TEMPLATES = {
  en: {
    location: 'Location: {location}.',
    timing: 'Timing: {timing}.',
    action: 'You can post your request to find available helpers.',
  },
  sv: {
    location: 'Plats: {location}.',
    timing: 'Tidpunkt: {timing}.',
    action: 'Du kan skapa en förfrågan för att hitta tillgängliga hjälpare.',
  },
  de: {
    location: 'Standort: {location}.',
    timing: 'Zeitpunkt: {timing}.',
    action: 'Sie können eine Anfrage erstellen, um verfügbare Helfer zu finden.',
  },
  es: {
    location: 'Ubicación: {location}.',
    timing: 'Momento: {timing}.',
    action: 'Puedes publicar tu solicitud para encontrar ayudantes disponibles.',
  },
  fa: {
    location: 'مکان: {location}.',
    timing: 'زمان: {timing}.',
    action: 'می‌توانید درخواست خود را ثبت کنید تا کمک‌کنندگان موجود را پیدا کنید.',
  },
};

/**
 * @param {NLPResult} nlpResult
 * @returns {string}
 */
export function buildReply(nlpResult) {
  const locale = nlpResult.detectedLanguage;
  const intent = nlpResult.intent;

  // Build reply based on intent
  if (intent === 'BOOK_SERVICE' && nlpResult.category) {
    let reply = CATEGORY_REPLIES[locale]?.[nlpResult.category] || REPLIES[locale].BOOK_SERVICE;

    // Add entity context
    const templates = CONTEXT_TEMPLATES[locale];
    if (nlpResult.entities.location && templates) {
      reply += ' ' + templates.location.replace('{location}', nlpResult.entities.location);
    }
    if (nlpResult.entities.timing && templates) {
      reply += ' ' + templates.timing.replace('{timing}', nlpResult.entities.timing);
    }
    if (templates) {
      reply += ' ' + templates.action;
    }

    return reply;
  }

  // Fallback to intent-based reply
  return REPLIES[locale]?.[intent] || REPLIES.en.UNKNOWN;
}
