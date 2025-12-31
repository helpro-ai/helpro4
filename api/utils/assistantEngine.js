// Context-Aware Assistant Engine with State Machine
// Shared between Vercel and Express servers
// @ts-check

import { analyzeMessage } from './nlp.js';
import { resolveService, suggestGroupForCustomService } from './serviceResolver.js';
import { getServiceById, getServiceName } from './serviceCatalog.js';
import { advanceConversationState, initConversationState, getMissingFields } from './conversationState.js';

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
 * Generate context-aware reply based on conversation state
 * @param {string} message
 * @param {Locale} locale
 * @param {ConversationState | null} previousState
 * @returns {AssistantResponse}
 */
export function generateAssistantResponse(message, locale, previousState) {
  // Step 1: Analyze message with NLP
  const nlpResult = analyzeMessage(message, locale);

  // Step 2: Initialize or update conversation state
  const currentState = previousState || initConversationState(nlpResult.intent);

  // Step 3: Extract new information from this message
  const newInfo = {
    intent: nlpResult.intent,
    location: nlpResult.entities.location,
    timing: nlpResult.entities.timing,
    scope: {
      rooms: nlpResult.entities.rooms,
      hours: nlpResult.entities.hours,
      items: nlpResult.entities.items,
    },
    budget: nlpResult.entities.budget,
  };

  // Step 4: Resolve service if needed
  if ((nlpResult.intent === 'BOOK_SERVICE' || nlpResult.intent === 'POST_TASK') && !currentState.serviceId) {
    const serviceMatch = resolveService(message, locale, nlpResult.category);

    if (serviceMatch.matchType === 'KNOWN') {
      newInfo.serviceId = serviceMatch.serviceId;
    } else if (serviceMatch.matchType === 'CUSTOM') {
      newInfo.customServiceDraft = serviceMatch.customServiceDraft;
    }
  }

  // Step 5: Advance conversation state
  const nextState = advanceConversationState(currentState, newInfo);

  // Step 6: Generate reply based on next step
  const reply = generateReplyForStep(nextState, locale, nlpResult);

  return {
    reply,
    nextState,
  };
}

/**
 * Generate reply for specific conversation step
 * @param {ConversationState} state
 * @param {Locale} locale
 * @param {NLPResult} nlpResult
 * @returns {string}
 */
function generateReplyForStep(state, locale, nlpResult) {
  const step = state.step;

  // RESOLVE_SERVICE step
  if (step === 'RESOLVE_SERVICE') {
    if (state.serviceId) {
      const serviceName = getServiceName(state.serviceId, locale);
      const confirmation = CONFIRMATIONS.SERVICE_RESOLVED[locale](serviceName);
      const nextQuestion = QUESTIONS.ASK_LOCATION[locale];
      return `${confirmation} ${nextQuestion}`;
    }

    if (state.customServiceDraft?.name) {
      const confirmation = CONFIRMATIONS.CUSTOM_SERVICE[locale](state.customServiceDraft.name);
      const nextQuestion = QUESTIONS.ASK_LOCATION[locale];
      return `${confirmation} ${nextQuestion}`;
    }

    // Fallback: ask what service they need
    return {
      en: 'What type of help do you need? (e.g., cleaning, moving, handyman)',
      sv: 'Vilken typ av hjälp behöver du? (t.ex. städning, flytt, hantverkare)',
      de: 'Welche Art von Hilfe benötigen Sie? (z.B. Reinigung, Umzug, Handwerker)',
      es: '¿Qué tipo de ayuda necesitas? (ej. limpieza, mudanza, manitas)',
      fa: 'به چه نوع کمکی نیاز دارید؟ (مثلاً نظافت، اسباب‌کشی، تعمیرکار)',
    }[locale];
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
 * Sanitize text output (prevent HTML injection)
 * @param {string} text
 * @returns {string}
 */
export function sanitizeText(text) {
  return text.replace(/<[^>]*>/g, '').trim();
}
