// Context-Aware Assistant Engine with State Machine
// Shared between Vercel and Express servers
// @ts-check

import { analyzeMessage } from './nlp.js';
import { resolveService, suggestGroupForCustomService } from './serviceResolver.js';
import { getServiceById, getServiceName } from './serviceCatalog.js';
import { advanceConversationState, initConversationState, getMissingFields } from './conversationState.js';
import { searchKB } from './knowledgeBase.js';

/**
 * @typedef {'en' | 'sv' | 'de' | 'es' | 'fa'} Locale
 * @typedef {import('./conversationState.js').ConversationState} ConversationState
 * @typedef {import('./conversationState.js').ConversationStep} ConversationStep
 * @typedef {import('./nlp.js').NLPResult} NLPResult
 * @typedef {{
 *   reply: string;
 *   nextState: ConversationState;
 *   suggestedActions?: string[];
 * }} AssistantResponse
 */

// Multilingual templates for questions
const QUESTIONS = {
  ASK_CATEGORY: {
    home: {
      en: ['What help do you need at home?', 'What kind of home service are you looking for?', 'How can I help with your home?'],
      sv: ['Vad behöver du hjälp med hemma?', 'Vilken typ av hemtjänst söker du?', 'Hur kan jag hjälpa dig hemma?'],
      de: ['Welche Hilfe benötigen Sie zu Hause?', 'Welche Art von Heimservice suchen Sie?', 'Wie kann ich Ihnen zu Hause helfen?'],
      es: ['¿Qué ayuda necesitas en casa?', '¿Qué tipo de servicio doméstico buscas?', '¿Cómo puedo ayudarte en casa?'],
      fa: ['در خانه به چه کمکی نیاز دارید؟', 'چه نوع خدمت خانگی می‌خواهید؟', 'چطور می‌توانم در خانه کمک کنم؟'],
    },
    office: {
      en: ['What help do you need at your office?', 'What office service are you looking for?', 'How can I help with your office?'],
      sv: ['Vad behöver du hjälp med på kontoret?', 'Vilken kontorsservice söker du?', 'Hur kan jag hjälpa dig på kontoret?'],
      de: ['Welche Hilfe benötigen Sie in Ihrem Büro?', 'Welchen Büroservice suchen Sie?', 'Wie kann ich Ihnen in Ihrem Büro helfen?'],
      es: ['¿Qué ayuda necesitas en tu oficina?', '¿Qué servicio de oficina buscas?', '¿Cómo puedo ayudarte en tu oficina?'],
      fa: ['در دفتر به چه کمکی نیاز دارید؟', 'چه خدمت اداری می‌خواهید؟', 'چطور می‌توانم در دفتر کمک کنم؟'],
    },
    hotel: {
      en: ['What help do you need for your hotel?', 'What hotel service are you looking for?', 'How can I help with your hotel?'],
      sv: ['Vad behöver du hjälp med för ditt hotell?', 'Vilken hotellservice söker du?', 'Hur kan jag hjälpa dig med ditt hotell?'],
      de: ['Welche Hilfe benötigen Sie für Ihr Hotel?', 'Welchen Hotelservice suchen Sie?', 'Wie kann ich Ihnen mit Ihrem Hotel helfen?'],
      es: ['¿Qué ayuda necesitas para tu hotel?', '¿Qué servicio hotelero buscas?', '¿Cómo puedo ayudarte con tu hotel?'],
      fa: ['برای هتل به چه کمکی نیاز دارید؟', 'چه خدمت هتلی می‌خواهید؟', 'چطور می‌توانم با هتل کمک کنم؟'],
    },
    default: {
      en: ['What kind of help are you looking for?', 'What service do you need?', 'How can I assist you?'],
      sv: ['Vilken typ av hjälp söker du?', 'Vilken tjänst behöver du?', 'Hur kan jag hjälpa dig?'],
      de: ['Welche Art von Hilfe suchen Sie?', 'Welchen Service benötigen Sie?', 'Wie kann ich Ihnen helfen?'],
      es: ['¿Qué tipo de ayuda buscas?', '¿Qué servicio necesitas?', '¿Cómo puedo ayudarte?'],
      fa: ['به چه کمکی نیاز دارید؟', 'چه خدمتی می‌خواهید؟', 'چطور می‌توانم کمک کنم؟'],
    },
  },
  ASK_LOCATION: {
    en: 'Where do you need this service? (e.g., Stockholm, Göteborg, your address)',
    sv: 'Var behöver du denna tjänst? (t.ex. Stockholm, Göteborg, din adress)',
    de: 'Wo benötigen Sie diesen Service? (z.B. Stockholm, Göteborg, Ihre Adresse)',
    es: '¿Dónde necesitas este servicio? (ej. Estocolmo, Gotemburgo, tu dirección)',
    fa: 'این خدمت را در کجا نیاز دارید؟ (مثلاً استکهلم، گوتبورگ، آدرس شما)',
  },
  ASK_TIME: {
    en: 'When would you like this done? (e.g., today, tomorrow, this weekend)',
    sv: 'När vill du ha det gjort? (t.ex. idag, imorgon, denna helg)',
    de: 'Wann möchten Sie dies erledigt haben? (z.B. heute, morgen, dieses Wochenende)',
    es: '¿Cuándo te gustaría que se hiciera? (ej. hoy, mañana, este fin de semana)',
    fa: 'چه زمانی می‌خواهید انجام شود؟ (مثلاً امروز، فردا، این آخر هفته)',
  },
  ASK_SCOPE_ROOMS: {
    en: 'How many rooms need cleaning?',
    sv: 'Hur många rum behöver städas?',
    de: 'Wie viele Zimmer müssen gereinigt werden?',
    es: '¿Cuántas habitaciones necesitan limpieza?',
    fa: 'چند اتاق نیاز به نظافت دارد؟',
  },
  ASK_SCOPE_HOURS: {
    en: 'Approximately how many hours do you think this will take?',
    sv: 'Ungefär hur många timmar tror du att detta tar?',
    de: 'Ungefähr wie viele Stunden wird dies Ihrer Meinung nach dauern?',
    es: '¿Aproximadamente cuántas horas crees que llevará esto?',
    fa: 'تقریباً فکر می‌کنید چند ساعت طول می‌کشد؟',
  },
  ASK_SCOPE_ITEMS: {
    en: 'How many items need to be handled?',
    sv: 'Hur många föremål behöver hanteras?',
    de: 'Wie viele Gegenstände müssen bearbeitet werden?',
    es: '¿Cuántos artículos necesitan ser manejados?',
    fa: 'چند مورد باید بررسی شود؟',
  },
  ASK_SERVICES_OFFERED: {
    en: 'What services can you offer? (e.g., cleaning, moving, handyman)',
    sv: 'Vilka tjänster kan du erbjuda? (t.ex. städning, flytt, hantverkare)',
    de: 'Welche Dienstleistungen können Sie anbieten? (z.B. Reinigung, Umzug, Handwerker)',
    es: '¿Qué servicios puedes ofrecer? (ej. limpieza, mudanza, manitas)',
    fa: 'چه خدماتی می‌توانید ارائه دهید؟ (مثلاً نظافت، اسباب‌کشی، تعمیرکار)',
  },
  ASK_AREA: {
    en: 'Which area do you want to work in?',
    sv: 'Vilket område vill du arbeta i?',
    de: 'In welchem Bereich möchten Sie arbeiten?',
    es: '¿En qué área quieres trabajar?',
    fa: 'در کدام منطقه می‌خواهید کار کنید؟',
  },
  ASK_AVAILABILITY: {
    en: 'What is your availability? (e.g., weekdays, weekends, evenings)',
    sv: 'Vad är din tillgänglighet? (t.ex. vardagar, helger, kvällar)',
    de: 'Was ist Ihre Verfügbarkeit? (z.B. Wochentage, Wochenenden, Abende)',
    es: '¿Cuál es tu disponibilidad? (ej. días laborables, fines de semana, tardes)',
    fa: 'در چه زمان‌هایی در دسترس هستید؟ (مثلاً روزهای هفته، آخر هفته، عصرها)',
  },
  GREETING: {
    en: 'Hello! I can help you book services or sign up as a helper. What would you like to do?',
    sv: 'Hej! Jag kan hjälpa dig boka tjänster eller registrera dig som hjälpare. Vad vill du göra?',
    de: 'Hallo! Ich kann Ihnen helfen, Dienste zu buchen oder sich als Helfer anzumelden. Was möchten Sie tun?',
    es: '¡Hola! Puedo ayudarte a reservar servicios o registrarte como ayudante. ¿Qué te gustaría hacer?',
    fa: 'سلام! می‌توانم به شما کمک کنم خدمات رزرو کنید یا به عنوان کمک‌کننده ثبت‌نام کنید. چه کاری می‌خواهید انجام دهید؟',
  },
};

const CONFIRMATIONS = {
  SERVICE_RESOLVED: {
    en: (serviceName) => `Great! I understand you need ${serviceName}.`,
    sv: (serviceName) => `Fantastiskt! Jag förstår att du behöver ${serviceName}.`,
    de: (serviceName) => `Großartig! Ich verstehe, dass Sie ${serviceName} benötigen.`,
    es: (serviceName) => `¡Genial! Entiendo que necesitas ${serviceName}.`,
    fa: (serviceName) => `عالی! می‌فهمم که به ${serviceName} نیاز دارید.`,
  },
  CUSTOM_SERVICE: {
    en: (name) => `I don't have "${name}" in my catalog yet. Let me help you create a custom service request.`,
    sv: (name) => `Jag har inte "${name}" i min katalog ännu. Låt mig hjälpa dig skapa en anpassad serviceförfrågan.`,
    de: (name) => `Ich habe "${name}" noch nicht in meinem Katalog. Lassen Sie mich Ihnen helfen, eine benutzerdefinierte Serviceanfrage zu erstellen.`,
    es: (name) => `Aún no tengo "${name}" en mi catálogo. Déjame ayudarte a crear una solicitud de servicio personalizada.`,
    fa: (name) => `من هنوز "${name}" را در کاتالوگ خود ندارم. بگذارید به شما کمک کنم یک درخواست سفارشی ایجاد کنید.`,
  },
  SUMMARY: {
    en: (details) => `Here's your request summary:\n${details}\n\nReady to post this request?`,
    sv: (details) => `Här är din förfråganssammanfattning:\n${details}\n\nRedo att posta denna förfrågan?`,
    de: (details) => `Hier ist Ihre Anfragenzusammenfassung:\n${details}\n\nBereit, diese Anfrage zu veröffentlichen?`,
    es: (details) => `Aquí está el resumen de tu solicitud:\n${details}\n\n¿Listo para publicar esta solicitud?`,
    fa: (details) => `خلاصه درخواست شما:\n${details}\n\nآماده ارسال این درخواست هستید؟`,
  },
};

/**
 * Check if message is a quick action token
 * @param {string} message
 * @returns {boolean}
 */
function isQuickActionToken(message) {
  const normalized = message.toLowerCase().trim();
  const quickActions = ['home', 'office', 'hotel', 'today', 'tomorrow', 'weekend'];
  return quickActions.includes(normalized);
}

/**
 * Check if message is a confirmation (Yes/Send/Submit)
 * @param {string} message
 * @param {Locale} locale
 * @returns {boolean}
 */
function isConfirmation(message, locale) {
  const normalized = message.toLowerCase().trim();

  // Remove common Persian typos/variations
  const persianNormalized = normalized.replace(/تب/g, 'تا').replace(/\s+/g, ' ');

  const confirmationKeywords = {
    en: ['yes', 'ok', 'okay', 'send', 'confirm', 'submit', 'post', 'book', 'go ahead', 'sure'],
    sv: ['ja', 'okej', 'ok', 'skicka', 'bekräfta', 'posta', 'boka', 'kör'],
    de: ['ja', 'ok', 'okay', 'senden', 'bestätigen', 'absenden', 'buchen'],
    es: ['sí', 'si', 'ok', 'okay', 'enviar', 'confirmar', 'publicar', 'reservar'],
    fa: ['بله', 'آره', 'اره', 'باشه', 'باشد', 'تایید', 'ارسال', 'بفرست', 'بفرستید', 'ثبت', 'ثبت کن', 'رزرو'],
  };

  const keywords = confirmationKeywords[locale] || confirmationKeywords.en;

  // Check if message contains any confirmation keyword
  for (const keyword of keywords) {
    if (persianNormalized.includes(keyword) || normalized.includes(keyword)) {
      return true;
    }
  }

  // Also check English keywords as fallback for all locales
  if (locale !== 'en') {
    for (const keyword of confirmationKeywords.en) {
      if (normalized.includes(keyword)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Normalize Persian day names and availability expressions
 * @param {string} text
 * @returns {string}
 */
function normalizePersianAvailability(text) {
  // Day name mappings (Persian → English)
  const dayMappings = {
    'شنبه': 'Saturday',
    'یکشنبه': 'Sunday',
    'دوشنبه': 'Monday',
    'سه شنبه': 'Tuesday',
    'سه‌شنبه': 'Tuesday',
    'چهارشنبه': 'Wednesday',
    'چهار شنبه': 'Wednesday',
    'پنجشنبه': 'Thursday',
    'پنج شنبه': 'Thursday',
    'جمعه': 'Friday',
  };

  // Common typos/variations
  const typoMappings = {
    'تب': 'تا',
    'شمبه': 'شنبه',
  };

  let normalized = text;

  // Fix typos first
  for (const [typo, correct] of Object.entries(typoMappings)) {
    normalized = normalized.replace(new RegExp(typo, 'g'), correct);
  }

  // Replace Persian day names with English equivalents
  for (const [persian, english] of Object.entries(dayMappings)) {
    normalized = normalized.replace(new RegExp(persian, 'g'), english);
  }

  return normalized;
}

/**
 * Select a variation from an array deterministically based on requestId
 * @param {string[]} variations
 * @param {string} requestId
 * @returns {string}
 */
function selectVariation(variations, requestId = '') {
  if (!Array.isArray(variations) || variations.length === 0) {
    return '';
  }
  if (variations.length === 1) {
    return variations[0];
  }
  // Simple hash of requestId to select variation
  let hash = 0;
  for (let i = 0; i < requestId.length; i++) {
    hash = ((hash << 5) - hash) + requestId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % variations.length;
  return variations[index];
}

/**
 * Generate context-aware reply based on conversation state
 * @param {string} message
 * @param {Locale} locale - Request locale from client
 * @param {ConversationState | null} previousState
 * @param {string} [requestId] - Request ID for deterministic variation selection
 * @returns {AssistantResponse}
 */
export function generateAssistantResponse(message, locale, previousState, requestId = '') {
  // Step 1: Analyze message with NLP (for parsing only, NOT for output language)
  const nlpResult = analyzeMessage(message, locale);

  // Step 2: Initialize or preserve conversation state
  const currentState = previousState || initConversationState(null);

  // Step 3: Lock output language to UI locale (always use request locale for replies)
  // This prevents language flip when user types in different language
  const uiLocale = locale || currentState.uiLocale || 'en';
  const replyLocale = uiLocale; // Output locked to UI selection

  // Step 4: Handle quick actions (Home/Office/Hotel/Today/Weekend)
  const normalized = message.toLowerCase().trim();
  const newInfo = {
    uiLocale: uiLocale, // Persist UI locale in state to prevent language flipping
    location: nlpResult.entities.location,
    timing: nlpResult.entities.timing,
    scope: {
      rooms: nlpResult.entities.rooms,
      hours: nlpResult.entities.hours,
      items: nlpResult.entities.items,
    },
    budget: nlpResult.entities.budget,
  };

  if (normalized === 'home' || normalized === 'office' || normalized === 'hotel') {
    // Quick action: set intent + segment, skip DETECT_INTENT
    newInfo.intent = 'BOOK_SERVICE';
    newInfo.segment = normalized;
  } else if (normalized === 'today' || normalized === 'weekend' || normalized === 'tomorrow') {
    // Quick action: set timing
    newInfo.timing = normalized;
    // If no intent yet, set to BOOK_SERVICE
    if (!currentState.intent) {
      newInfo.intent = 'BOOK_SERVICE';
    }
  } else {
    // Only update intent from NLP if no existing intent in state
    if (!currentState.intent || currentState.intent === 'UNKNOWN') {
      newInfo.intent = nlpResult.intent;
    }
  }

  // Step 5: Resolve service if needed (but not for quick actions)
  const isQuickAction = ['home', 'office', 'hotel', 'today', 'weekend', 'tomorrow'].includes(normalized);
  if (!isQuickAction && (nlpResult.intent === 'BOOK_SERVICE' || nlpResult.intent === 'POST_TASK') && !currentState.serviceId) {
    const serviceMatch = resolveService(message, replyLocale, nlpResult.category);

    if (serviceMatch.matchType === 'KNOWN') {
      newInfo.serviceId = serviceMatch.serviceId;
    } else if (serviceMatch.matchType === 'CUSTOM') {
      newInfo.customServiceDraft = serviceMatch.customServiceDraft;
    }
  }

  // Step 5b: Capture services offered for PROVIDER_SIGNUP
  if (currentState.intent === 'PROVIDER_SIGNUP' && currentState.step === 'ASK_SERVICES_OFFERED' && message.trim().length > 0) {
    // Extract services from message (split by common separators)
    const services = message
      .split(/[,;\/\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && s.length < 50); // Basic validation

    if (services.length > 0) {
      newInfo.servicesOffered = services;
    }
  }

  // Step 5c: Capture area for PROVIDER_SIGNUP
  if (currentState.intent === 'PROVIDER_SIGNUP' && currentState.step === 'ASK_AREA' && message.trim().length > 0) {
    newInfo.area = message.trim();
  }

  // Step 5d: Capture availability for PROVIDER_SIGNUP
  if (currentState.intent === 'PROVIDER_SIGNUP' && currentState.step === 'ASK_AVAILABILITY' && message.trim().length > 0) {
    // Normalize Persian day names to English for consistent storage
    newInfo.availability = normalizePersianAvailability(message.trim());
  }

  // Step 5e: Handle confirmation at CONFIRM_SUMMARY or CONFIRM_PROFILE steps
  if ((currentState.step === 'CONFIRM_SUMMARY' || currentState.step === 'CONFIRM_PROFILE') && isConfirmation(message, uiLocale)) {
    // User confirmed - transition to COMPLETE
    const nextState = { ...currentState, step: 'COMPLETE' };

    // Generate success message
    const successMessage = {
      en: currentState.intent === 'PROVIDER_SIGNUP'
        ? 'Great! Your helper profile has been created. You\'ll start receiving booking requests from customers in your area soon.'
        : 'Perfect! Your service request has been posted. You\'ll receive offers from helpers in your area shortly.',
      sv: currentState.intent === 'PROVIDER_SIGNUP'
        ? 'Fantastiskt! Din hjälparprofil har skapats. Du kommer snart att börja ta emot bokningsförfrågningar från kunder i ditt område.'
        : 'Perfekt! Din serviceförfrågan har publicerats. Du får snart erbjudanden från hjälpare i ditt område.',
      de: currentState.intent === 'PROVIDER_SIGNUP'
        ? 'Großartig! Ihr Helferprofil wurde erstellt. Sie erhalten bald Buchungsanfragen von Kunden in Ihrer Nähe.'
        : 'Perfekt! Ihre Serviceanfrage wurde veröffentlicht. Sie erhalten in Kürze Angebote von Helfern in Ihrer Nähe.',
      es: currentState.intent === 'PROVIDER_SIGNUP'
        ? '¡Genial! Tu perfil de ayudante ha sido creado. Pronto comenzarás a recibir solicitudes de reserva de clientes en tu área.'
        : '¡Perfecto! Tu solicitud de servicio ha sido publicada. Recibirás ofertas de ayudantes en tu área en breve.',
      fa: currentState.intent === 'PROVIDER_SIGNUP'
        ? 'عالی! پروفایل کمک‌کننده شما ایجاد شد. به زودی درخواست‌های رزرو از مشتریان منطقه خود را دریافت خواهید کرد.'
        : 'عالی! درخواست خدمت شما ثبت شد. به زودی پیشنهادهایی از کمک‌کنندگان منطقه خود دریافت خواهید کرد.',
    };

    return {
      reply: successMessage[uiLocale] || successMessage.en,
      nextState,
      suggestedActions: [], // No suggestions after completion
    };
  }

  // Step 5f: Handle GENERAL_QA / ACCOUNT_HELP with Knowledge Base lookup
  if ((nlpResult.intent === 'GENERAL_QA' || nlpResult.intent === 'ACCOUNT_HELP') && !isQuickAction) {
    const kbMatch = searchKB(message, uiLocale);

    if (kbMatch) {
      // Found answer in KB
      const nextState = { ...currentState, step: 'COMPLETE', intent: nlpResult.intent, uiLocale };

      // Generate related suggestions based on KB category
      const relatedSuggestions = generateKBSuggestions(kbMatch.entry.category, uiLocale);

      return {
        reply: kbMatch.entry.answer[uiLocale] || kbMatch.entry.answer.en,
        nextState,
        suggestedActions: relatedSuggestions,
      };
    }
    // If no KB match, fall through to normal flow (will ask clarifying question)
  }

  // Step 6: Advance conversation state
  const nextState = advanceConversationState(currentState, newInfo);

  // Step 7: Generate reply based on next step using reply locale
  const reply = generateReplyForStep(nextState, replyLocale, nlpResult, requestId);

  // Step 8: Generate context-aware suggestions
  const suggestedActions = generateSuggestions(nextState, replyLocale);

  return {
    reply,
    nextState,
    suggestedActions,
  };
}

/**
 * Generate reply for specific conversation step
 * @param {ConversationState} state
 * @param {Locale} locale
 * @param {NLPResult} nlpResult
 * @param {string} requestId
 * @returns {string}
 */
function generateReplyForStep(state, locale, nlpResult, requestId = '') {
  const step = state.step;

  // DETECT_INTENT step (greetings and unknown intent)
  if (step === 'DETECT_INTENT') {
    // Check if message is a greeting (short text with UNKNOWN intent)
    const isGreeting = nlpResult.intent === 'UNKNOWN';

    if (isGreeting) {
      // Context-aware greeting response
      if (state.segment) {
        // User already selected segment, ask for category
        const segmentKey = state.segment;
        const variations = QUESTIONS.ASK_CATEGORY[segmentKey] || QUESTIONS.ASK_CATEGORY.default;
        return selectVariation(variations[locale], requestId);
      }
      // No context yet, use generic greeting
      return QUESTIONS.GREETING[locale];
    }

    // Non-greeting UNKNOWN: ask what they want to do
    return {
      en: 'Would you like to book a service or sign up as a helper?',
      sv: 'Vill du boka en tjänst eller registrera dig som hjälpare?',
      de: 'Möchten Sie einen Service buchen oder sich als Helfer registrieren?',
      es: '¿Te gustaría reservar un servicio o registrarte como ayudante?',
      fa: 'می‌خواهید یک خدمت رزرو کنید یا به عنوان کمک‌کننده ثبت‌نام کنید؟',
    }[locale];
  }

  // RESOLVE_SERVICE step (ask for category)
  if (step === 'RESOLVE_SERVICE') {
    // Use segment-specific question with variation
    const segmentKey = state.segment || 'default';
    const variations = QUESTIONS.ASK_CATEGORY[segmentKey] || QUESTIONS.ASK_CATEGORY.default;
    return selectVariation(variations[locale], requestId);
  }


  // ASK_LOCATION step
  if (step === 'ASK_LOCATION') {
    return QUESTIONS.ASK_LOCATION[locale];
  }

  // ASK_TIME step
  if (step === 'ASK_TIME') {
    return QUESTIONS.ASK_TIME[locale];
  }

  // ASK_SCOPE step
  if (step === 'ASK_SCOPE') {
    const service = state.serviceId ? getServiceById(state.serviceId) : null;
    const unit = service?.typicalUnit || 'hours';

    if (unit === 'rooms') {
      return QUESTIONS.ASK_SCOPE_ROOMS[locale];
    } else if (unit === 'items') {
      return QUESTIONS.ASK_SCOPE_ITEMS[locale];
    } else {
      return QUESTIONS.ASK_SCOPE_HOURS[locale];
    }
  }

  // CONFIRM_SUMMARY step
  if (step === 'CONFIRM_SUMMARY') {
    const serviceName = state.serviceId ? getServiceName(state.serviceId, locale) : state.customServiceDraft?.name || 'service';
    const details = [
      `• ${locale === 'en' ? 'Service' : locale === 'sv' ? 'Tjänst' : locale === 'de' ? 'Service' : locale === 'es' ? 'Servicio' : 'خدمت'}: ${serviceName}`,
      state.location ? `• ${locale === 'en' ? 'Location' : locale === 'sv' ? 'Plats' : locale === 'de' ? 'Ort' : locale === 'es' ? 'Ubicación' : 'مکان'}: ${state.location}` : null,
      state.timing ? `• ${locale === 'en' ? 'Time' : locale === 'sv' ? 'Tid' : locale === 'de' ? 'Zeit' : locale === 'es' ? 'Tiempo' : 'زمان'}: ${state.timing}` : null,
      state.scope?.rooms ? `• ${locale === 'en' ? 'Rooms' : locale === 'sv' ? 'Rum' : locale === 'de' ? 'Zimmer' : locale === 'es' ? 'Habitaciones' : 'اتاق‌ها'}: ${state.scope.rooms}` : null,
      state.scope?.hours ? `• ${locale === 'en' ? 'Hours' : locale === 'sv' ? 'Timmar' : locale === 'de' ? 'Stunden' : locale === 'es' ? 'Horas' : 'ساعت‌ها'}: ${state.scope.hours}` : null,
      state.scope?.items ? `• ${locale === 'en' ? 'Items' : locale === 'sv' ? 'Föremål' : locale === 'de' ? 'Gegenstände' : locale === 'es' ? 'Artículos' : 'موارد'}: ${state.scope.items}` : null,
    ].filter(Boolean).join('\n');

    return CONFIRMATIONS.SUMMARY[locale](details);
  }

  // PROVIDER_SIGNUP steps
  if (step === 'ASK_SERVICES_OFFERED') {
    return QUESTIONS.ASK_SERVICES_OFFERED[locale];
  }

  if (step === 'ASK_AREA') {
    return QUESTIONS.ASK_AREA[locale];
  }

  if (step === 'ASK_AVAILABILITY') {
    return QUESTIONS.ASK_AVAILABILITY[locale];
  }

  if (step === 'CONFIRM_PROFILE') {
    const details = [
      state.servicesOffered ? `• ${locale === 'en' ? 'Services' : locale === 'sv' ? 'Tjänster' : locale === 'de' ? 'Dienstleistungen' : locale === 'es' ? 'Servicios' : 'خدمات'}: ${state.servicesOffered.join(', ')}` : null,
      state.area ? `• ${locale === 'en' ? 'Area' : locale === 'sv' ? 'Område' : locale === 'de' ? 'Bereich' : locale === 'es' ? 'Área' : 'منطقه'}: ${state.area}` : null,
      state.availability ? `• ${locale === 'en' ? 'Availability' : locale === 'sv' ? 'Tillgänglighet' : locale === 'de' ? 'Verfügbarkeit' : locale === 'es' ? 'Disponibilidad' : 'در دسترس بودن'}: ${state.availability}` : null,
    ].filter(Boolean).join('\n');

    return CONFIRMATIONS.SUMMARY[locale](details);
  }

  // GENERAL_QA: Ask what topic they want to know about
  if (state.intent === 'GENERAL_QA') {
    return {
      en: 'What would you like to know about? (e.g., pricing, payment methods, safety, how it works)',
      sv: 'Vad vill du veta mer om? (t.ex. priser, betalningsmetoder, säkerhet, hur det fungerar)',
      de: 'Was möchten Sie wissen? (z.B. Preise, Zahlungsmethoden, Sicherheit, wie es funktioniert)',
      es: '¿Qué te gustaría saber? (ej. precios, métodos de pago, seguridad, cómo funciona)',
      fa: 'چه چیزی می‌خواهید بدانید؟ (مثلاً قیمت‌ها، روش‌های پرداخت، امنیت، چگونه کار می‌کند)',
    }[locale];
  }

  // Default fallback
  return {
    en: 'How can I help you today?',
    sv: 'Hur kan jag hjälpa dig idag?',
    de: 'Wie kann ich Ihnen heute helfen?',
    es: '¿Cómo puedo ayudarte hoy?',
    fa: 'امروز چطور می‌توانم به شما کمک کنم؟',
  }[locale];
}

/**
 * Generate context-aware suggestions based on conversation state
 * @param {ConversationState} state
 * @param {Locale} locale
 * @returns {Array<{id: string, label: string, value: string}>}
 */
function generateSuggestions(state, locale) {
  const suggestions = [];

  // DETECT_INTENT: Suggest booking or signup
  if (state.step === 'DETECT_INTENT' && (!state.intent || state.intent === 'UNKNOWN')) {
    const suggestions = {
      en: {
        book: { label: 'Book a service', value: 'I want to book a service' },
        signup: { label: 'Become a helper', value: 'sign up as helper' },
      },
      sv: {
        book: { label: 'Boka tjänst', value: 'boka' },
        signup: { label: 'Bli hjälpare', value: 'bli hjälpare' },
      },
      de: {
        book: { label: 'Service buchen', value: 'buchen' },
        signup: { label: 'Helfer werden', value: 'helfer werden' },
      },
      es: {
        book: { label: 'Reservar servicio', value: 'reservar' },
        signup: { label: 'Ser ayudante', value: 'convertirme en ayudante' },
      },
      fa: {
        book: { label: 'رزرو خدمت', value: 'رزرو خدمت' },
        signup: { label: 'همکار شدن', value: 'ثبت نام' },
      },
    };
    const s = suggestions[locale] || suggestions.en;
    return [
      { id: 'book', label: s.book.label, value: s.book.value },
      { id: 'signup', label: s.signup.label, value: s.signup.value },
    ];
  }

  // RESOLVE_SERVICE: Suggest popular services
  if (state.step === 'RESOLVE_SERVICE') {
    const serviceLabels = {
      en: { cleaning: 'Cleaning', moving: 'Moving', handyman: 'Handyman' },
      sv: { cleaning: 'Städning', moving: 'Flytt', handyman: 'Hantverkare' },
      de: { cleaning: 'Reinigung', moving: 'Umzug', handyman: 'Handwerker' },
      es: { cleaning: 'Limpieza', moving: 'Mudanza', handyman: 'Manitas' },
      fa: { cleaning: 'نظافت', moving: 'اسباب‌کشی', handyman: 'تعمیرکار' },
    };
    const l = serviceLabels[locale] || serviceLabels.en;
    return [
      { id: 'cleaning', label: l.cleaning, value: l.cleaning },
      { id: 'moving', label: l.moving, value: l.moving },
      { id: 'handyman', label: l.handyman, value: l.handyman },
    ];
  }

  // ASK_LOCATION: Suggest major cities
  if (state.step === 'ASK_LOCATION') {
    return [
      { id: 'stockholm', label: 'Stockholm', value: 'Stockholm' },
      { id: 'goteborg', label: 'Göteborg', value: 'Göteborg' },
      { id: 'malmo', label: 'Malmö', value: 'Malmö' },
    ];
  }

  // ASK_TIME: Suggest time options
  if (state.step === 'ASK_TIME') {
    const timeLabels = {
      en: { today: 'Today', tomorrow: 'Tomorrow', weekend: 'This weekend' },
      sv: { today: 'Idag', tomorrow: 'Imorgon', weekend: 'I helgen' },
      de: { today: 'Heute', tomorrow: 'Morgen', weekend: 'Am Wochenende' },
      es: { today: 'Hoy', tomorrow: 'Mañana', weekend: 'Este fin de semana' },
      fa: { today: 'امروز', tomorrow: 'فردا', weekend: 'آخر هفته' },
    };
    const l = timeLabels[locale] || timeLabels.en;
    return [
      { id: 'today', label: l.today, value: l.today },
      { id: 'tomorrow', label: l.tomorrow, value: l.tomorrow },
      { id: 'weekend', label: l.weekend, value: l.weekend },
    ];
  }

  // ASK_SERVICES_OFFERED: Suggest popular helper services
  if (state.step === 'ASK_SERVICES_OFFERED') {
    const serviceLabels = {
      en: { cleaning: 'Cleaning', moving: 'Moving', handyman: 'Handyman' },
      sv: { cleaning: 'Städning', moving: 'Flytt', handyman: 'Hantverkare' },
      de: { cleaning: 'Reinigung', moving: 'Umzug', handyman: 'Handwerker' },
      es: { cleaning: 'Limpieza', moving: 'Mudanza', handyman: 'Manitas' },
      fa: { cleaning: 'نظافت', moving: 'اسباب‌کشی', handyman: 'تعمیرکار' },
    };
    const l = serviceLabels[locale] || serviceLabels.en;
    return [
      { id: 'cleaning', label: l.cleaning, value: l.cleaning },
      { id: 'moving', label: l.moving, value: l.moving },
      { id: 'handyman', label: l.handyman, value: l.handyman },
    ];
  }

  // ASK_AREA: Suggest major cities
  if (state.step === 'ASK_AREA') {
    return [
      { id: 'stockholm', label: 'Stockholm', value: 'Stockholm' },
      { id: 'goteborg', label: 'Göteborg', value: 'Göteborg' },
      { id: 'malmo', label: 'Malmö', value: 'Malmö' },
    ];
  }

  // ASK_AVAILABILITY: Suggest common availability patterns
  if (state.step === 'ASK_AVAILABILITY') {
    const availLabels = {
      en: { weekdays: 'Weekdays', weekends: 'Weekends', evenings: 'Evenings' },
      sv: { weekdays: 'Vardagar', weekends: 'Helger', evenings: 'Kvällar' },
      de: { weekdays: 'Wochentage', weekends: 'Wochenenden', evenings: 'Abende' },
      es: { weekdays: 'Días laborables', weekends: 'Fines de semana', evenings: 'Tardes' },
      fa: { weekdays: 'روزهای هفته', weekends: 'آخر هفته', evenings: 'عصرها' },
    };
    const l = availLabels[locale] || availLabels.en;
    return [
      { id: 'weekdays', label: l.weekdays, value: l.weekdays },
      { id: 'weekends', label: l.weekends, value: l.weekends },
      { id: 'evenings', label: l.evenings, value: l.evenings },
    ];
  }

  // CONFIRM_SUMMARY or CONFIRM_PROFILE: Suggest confirm/edit actions
  if (state.step === 'CONFIRM_SUMMARY' || state.step === 'CONFIRM_PROFILE') {
    const confirmLabels = {
      en: { confirm: 'Send', edit: 'Edit' },
      sv: { confirm: 'Skicka', edit: 'Redigera' },
      de: { confirm: 'Senden', edit: 'Bearbeiten' },
      es: { confirm: 'Enviar', edit: 'Editar' },
      fa: { confirm: 'ارسال', edit: 'ویرایش' },
    };
    const confirmValues = {
      en: { confirm: 'yes send', edit: 'edit' },
      sv: { confirm: 'ja skicka', edit: 'redigera' },
      de: { confirm: 'ja senden', edit: 'bearbeiten' },
      es: { confirm: 'sí enviar', edit: 'editar' },
      fa: { confirm: 'بله ارسال', edit: 'ویرایش' },
    };
    const l = confirmLabels[locale] || confirmLabels.en;
    const v = confirmValues[locale] || confirmValues.en;
    return [
      { id: 'confirm', label: l.confirm, value: v.confirm },
      { id: 'edit', label: l.edit, value: v.edit },
    ];
  }

  return suggestions;
}

/**
 * Generate KB-related suggestions based on category
 * @param {string} category
 * @param {Locale} locale
 * @returns {Array<{id: string, label: string, value: string}>}
 */
function generateKBSuggestions(category, locale) {
  const suggestions = {
    PRICING: {
      en: [
        { id: 'book', label: 'Book a service', value: 'I want to book a service' },
        { id: 'price-change', label: 'Can I change price?', value: 'Can I change the price after posting?' },
      ],
      sv: [
        { id: 'book', label: 'Boka tjänst', value: 'boka' },
        { id: 'price-change', label: 'Kan jag ändra pris?', value: 'Kan jag ändra priset efter att ha lagt upp?' },
      ],
      fa: [
        { id: 'book', label: 'رزرو خدمت', value: 'رزرو خدمت' },
        { id: 'price-change', label: 'تغییر قیمت؟', value: 'می‌توانم قیمت را بعد از ثبت تغییر دهم؟' },
      ],
    },
    PAYMENTS: {
      en: [
        { id: 'book', label: 'Book a service', value: 'I want to book a service' },
        { id: 'pricing', label: 'How much does it cost?', value: 'How much does it cost?' },
      ],
      sv: [
        { id: 'book', label: 'Boka tjänst', value: 'boka' },
        { id: 'pricing', label: 'Hur mycket kostar det?', value: 'Hur mycket kostar det?' },
      ],
      fa: [
        { id: 'book', label: 'رزرو خدمت', value: 'رزرو خدمت' },
        { id: 'pricing', label: 'چقدر هزینه دارد؟', value: 'چقدر هزینه دارد؟' },
      ],
    },
    SAFETY: {
      en: [
        { id: 'book', label: 'Book a service', value: 'I want to book a service' },
        { id: 'how-works', label: 'How does it work?', value: 'How does it work?' },
      ],
      sv: [
        { id: 'book', label: 'Boka tjänst', value: 'boka' },
        { id: 'how-works', label: 'Hur fungerar det?', value: 'Hur fungerar det?' },
      ],
      fa: [
        { id: 'book', label: 'رزرو خدمت', value: 'رزرو خدمت' },
        { id: 'how-works', label: 'چگونه کار می‌کند؟', value: 'چگونه کار می‌کند؟' },
      ],
    },
    HOW_IT_WORKS: {
      en: [
        { id: 'book', label: 'Book a service', value: 'I want to book a service' },
        { id: 'become-helper', label: 'Become a helper', value: 'I want to become a helper' },
      ],
      sv: [
        { id: 'book', label: 'Boka tjänst', value: 'boka' },
        { id: 'become-helper', label: 'Bli hjälpare', value: 'Jag vill bli hjälpare' },
      ],
      fa: [
        { id: 'book', label: 'رزرو خدمت', value: 'رزرو خدمت' },
        { id: 'become-helper', label: 'همکار شدن', value: 'می‌خواهم همکار شوم' },
      ],
    },
    SERVICES: {
      en: [
        { id: 'book', label: 'Book this service', value: 'I want to book this service' },
        { id: 'more-services', label: 'Other services', value: 'What other services do you offer?' },
      ],
      sv: [
        { id: 'book', label: 'Boka denna tjänst', value: 'Jag vill boka denna tjänst' },
        { id: 'more-services', label: 'Andra tjänster', value: 'Vilka andra tjänster erbjuder ni?' },
      ],
      fa: [
        { id: 'book', label: 'رزرو این خدمت', value: 'می‌خواهم این خدمت را رزرو کنم' },
        { id: 'more-services', label: 'خدمات دیگر', value: 'چه خدمات دیگری ارائه می‌دهید؟' },
      ],
    },
    PLATFORM: {
      en: [
        { id: 'book', label: 'Book a service', value: 'I want to book a service' },
        { id: 'become-helper', label: 'Become a helper', value: 'I want to become a helper' },
      ],
      sv: [
        { id: 'book', label: 'Boka tjänst', value: 'boka' },
        { id: 'become-helper', label: 'Bli hjälpare', value: 'Jag vill bli hjälpare' },
      ],
      fa: [
        { id: 'book', label: 'رزرو خدمت', value: 'رزرو خدمت' },
        { id: 'become-helper', label: 'همکار شدن', value: 'می‌خواهم همکار شوم' },
      ],
    },
  };

  const categorySuggestions = suggestions[category] || suggestions.PLATFORM;
  return categorySuggestions[locale] || categorySuggestions.en;
}

/**
 * Sanitize text output (prevent HTML injection)
 * @param {string} text
 * @returns {string}
 */
export function sanitizeText(text) {
  return text.replace(/<[^>]*>/g, '').trim();
}
