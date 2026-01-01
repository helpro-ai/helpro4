import en from './en';
import sv from './sv';
import de from './de';
import es from './es';

export type Locale = 'en' | 'sv' | 'de' | 'es' | 'fa';

// Use 'en' as fallback for 'fa' until full Persian translation is added
const translations = { en, sv, de, es, fa: en };

export function t(key: string, locale: Locale = 'en'): string {
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}

export function getLocale(): Locale {
  const stored = localStorage.getItem('helpro_language') || sessionStorage.getItem('helpro_language');
  return (stored as Locale) || 'en';
}

export function getSpeechLang(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: 'en-US',
    sv: 'sv-SE',
    de: 'de-DE',
    es: 'es-ES',
    fa: 'fa-IR',
  };
  return map[locale] || 'en-US';
}

// Re-export the useLanguage hook for convenience
export { useLanguage } from '../contexts/LanguageContext';

// Custom hook for reactive translations
import { useLanguage as useLanguageContext } from '../contexts/LanguageContext';

export function useTranslation() {
  const { locale } = useLanguageContext();

  return {
    t: (key: string) => t(key, locale),
    locale,
  };
}
