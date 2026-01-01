import type { Locale } from './serviceCatalog.js';

export type IntentType = 'BOOK_SERVICE' | 'POST_TASK' | 'FIND_HELPER' | 'PROVIDER_SIGNUP' | 'GENERAL_QA' | 'ACCOUNT_HELP' | 'UNKNOWN';
export type ConversationStep = 'DETECT_INTENT' | 'RESOLVE_SERVICE' | 'ASK_LOCATION' | 'ASK_TIME' | 'ASK_SCOPE' | 'ASK_BUDGET' | 'CONFIRM_SUMMARY' | 'ASK_SERVICES_OFFERED' | 'ASK_AREA' | 'ASK_AVAILABILITY' | 'CONFIRM_PROFILE' | 'COMPLETE';

export interface ConversationState {
  step: ConversationStep;
  intent?: IntentType;
  serviceId?: string;
  customServiceId?: string;
  customServiceDraft?: {
    name?: string;
    groupId?: string;
    locale?: Locale;
  };
  location?: string;
  timing?: string;
  scope?: {
    rooms?: number;
    hours?: number;
    items?: number;
  };
  budget?: string;
  servicesOffered?: string[];
  area?: string;
  availability?: string;
}

export function initConversationState(intent?: IntentType): ConversationState;

export function advanceConversationState(
  currentState: ConversationState,
  newInfo: Partial<ConversationState>
): ConversationState;

export function isConversationComplete(state: ConversationState): boolean;
export function getMissingFields(state: ConversationState): string[];
