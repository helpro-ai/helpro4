// Conversation State Machine for guided concierge flows
// @ts-check

/**
 * @typedef {'en' | 'sv' | 'de' | 'es' | 'fa'} Locale
 * @typedef {'BOOK_SERVICE' | 'POST_TASK' | 'FIND_HELPER' | 'PROVIDER_SIGNUP' | 'GENERAL_QA' | 'ACCOUNT_HELP' | 'UNKNOWN'} IntentType
 * @typedef {'DETECT_INTENT' | 'RESOLVE_SERVICE' | 'ASK_LOCATION' | 'ASK_TIME' | 'ASK_SCOPE' | 'ASK_BUDGET' | 'CONFIRM_SUMMARY' | 'ASK_SERVICES_OFFERED' | 'ASK_AREA' | 'ASK_AVAILABILITY' | 'CONFIRM_PROFILE' | 'COMPLETE'} ConversationStep
 * @typedef {{
 *   step: ConversationStep;
 *   intent?: IntentType;
 *   segment?: string;
 *   serviceId?: string;
 *   customServiceId?: string;
 *   customServiceDraft?: {
 *     name?: string;
 *     groupId?: string;
 *     locale?: Locale;
 *   };
 *   location?: string;
 *   timing?: string;
 *   scope?: {
 *     rooms?: number;
 *     hours?: number;
 *     items?: number;
 *   };
 *   budget?: string;
 *   servicesOffered?: string[];
 *   area?: string;
 *   availability?: string;
 * }} ConversationState
 */

/**
 * Initialize conversation state
 * @param {IntentType} [intent]
 * @returns {ConversationState}
 */
export function initConversationState(intent) {
  return {
    step: intent ? 'RESOLVE_SERVICE' : 'DETECT_INTENT',
    intent,
  };
}

/**
 * Determine next step based on current state and new information
 * @param {ConversationState} currentState
 * @param {{
 *   intent?: IntentType;
 *   segment?: string;
 *   serviceId?: string;
 *   customServiceDraft?: any;
 *   location?: string;
 *   timing?: string;
 *   scope?: any;
 *   budget?: string;
 *   servicesOffered?: string[];
 *   area?: string;
 *   availability?: string;
 * }} newInfo
 * @returns {ConversationState}
 */
export function advanceConversationState(currentState, newInfo) {
  const nextState = { ...currentState };

  // Merge new information
  if (newInfo.intent) nextState.intent = newInfo.intent;
  if (newInfo.segment) nextState.segment = newInfo.segment;
  if (newInfo.serviceId) nextState.serviceId = newInfo.serviceId;
  if (newInfo.customServiceDraft) nextState.customServiceDraft = { ...nextState.customServiceDraft, ...newInfo.customServiceDraft };
  if (newInfo.location) nextState.location = newInfo.location;
  if (newInfo.timing) nextState.timing = newInfo.timing;
  if (newInfo.scope) nextState.scope = { ...nextState.scope, ...newInfo.scope };
  if (newInfo.budget) nextState.budget = newInfo.budget;
  if (newInfo.servicesOffered) nextState.servicesOffered = newInfo.servicesOffered;
  if (newInfo.area) nextState.area = newInfo.area;
  if (newInfo.availability) nextState.availability = newInfo.availability;

  // Determine next step based on intent and what we have
  if (nextState.intent === 'BOOK_SERVICE' || nextState.intent === 'POST_TASK') {
    if (!nextState.serviceId && !nextState.customServiceDraft?.name) {
      nextState.step = 'RESOLVE_SERVICE';
    } else if (!nextState.location) {
      nextState.step = 'ASK_LOCATION';
    } else if (!nextState.timing) {
      nextState.step = 'ASK_TIME';
    } else if (!nextState.scope) {
      nextState.step = 'ASK_SCOPE';
    } else {
      nextState.step = 'CONFIRM_SUMMARY';
    }
  } else if (nextState.intent === 'PROVIDER_SIGNUP') {
    if (!nextState.servicesOffered || nextState.servicesOffered.length === 0) {
      nextState.step = 'ASK_SERVICES_OFFERED';
    } else if (!nextState.area) {
      nextState.step = 'ASK_AREA';
    } else if (!nextState.availability) {
      nextState.step = 'ASK_AVAILABILITY';
    } else {
      nextState.step = 'CONFIRM_PROFILE';
    }
  } else if (nextState.intent === 'GENERAL_QA' || nextState.intent === 'ACCOUNT_HELP' || nextState.intent === 'FIND_HELPER') {
    nextState.step = 'COMPLETE'; // Single-turn Q&A
  } else {
    nextState.step = 'DETECT_INTENT';
  }

  return nextState;
}

/**
 * Check if conversation flow is complete
 * @param {ConversationState} state
 * @returns {boolean}
 */
export function isConversationComplete(state) {
  return state.step === 'COMPLETE' || state.step === 'CONFIRM_SUMMARY' || state.step === 'CONFIRM_PROFILE';
}

/**
 * Get missing fields for current intent
 * @param {ConversationState} state
 * @returns {string[]}
 */
export function getMissingFields(state) {
  const missing = [];

  if (state.intent === 'BOOK_SERVICE' || state.intent === 'POST_TASK') {
    if (!state.serviceId && !state.customServiceDraft?.name) missing.push('service');
    if (!state.location) missing.push('location');
    if (!state.timing) missing.push('timing');
    if (!state.scope) missing.push('scope');
  } else if (state.intent === 'PROVIDER_SIGNUP') {
    if (!state.servicesOffered || state.servicesOffered.length === 0) missing.push('services');
    if (!state.area) missing.push('area');
    if (!state.availability) missing.push('availability');
  }

  return missing;
}
