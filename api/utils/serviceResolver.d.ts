import type { Locale } from './serviceCatalog.js';

export type MatchType = 'KNOWN' | 'MAPPED' | 'CUSTOM';

export interface ServiceMatch {
  matchType: MatchType;
  serviceId?: string;
  confidence: number;
  reason: string;
  customServiceDraft?: {
    name: string;
    groupId?: string;
    locale: Locale;
  };
}

export function resolveService(
  message: string,
  locale: Locale,
  detectedCategory?: string
): ServiceMatch;

export function suggestGroupForCustomService(
  serviceName: string,
  locale: Locale
): string | undefined;
