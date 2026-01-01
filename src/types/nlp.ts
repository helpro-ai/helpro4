import { Locale } from '../i18n';

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
  category?: string; // Must match catalog.ts IDs only
  entities: NLPEntity;
  confidence?: number;
}

export interface IntakeState {
  intent: IntentType | null;
  step?: string;
  draft?: any;
}
