export type Locale = 'en' | 'sv' | 'de' | 'es' | 'fa';
export type IntentType = 'BOOK_SERVICE' | 'PROVIDER_SIGNUP' | 'GENERAL_QA' | 'UNKNOWN';

export interface NLPEntity {
  location?: string;
  timing?: string;
  budget?: string;
  hours?: number;
  items?: number;
  rooms?: number;
}

export interface NLPResult {
  detectedLanguage: Locale;
  intent: IntentType;
  category?: string;
  entities: NLPEntity;
}

export function analyzeMessage(text: string, userLocale?: string): NLPResult;
