import type { Locale } from './serviceCatalog.js';
import type { ConversationState } from './conversationState.js';

export interface AssistantResponse {
  reply: string;
  nextState: ConversationState;
  suggestedActions?: string[];
}

export function generateAssistantResponse(
  message: string,
  locale: Locale,
  previousState: ConversationState | null
): AssistantResponse;

export function sanitizeText(text: string): string;
