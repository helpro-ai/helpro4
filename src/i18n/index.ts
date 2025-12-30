import en from './en';
import sv from './sv';
import de from './de';
import es from './es';

export type Locale = 'en' | 'sv' | 'de' | 'es';

const translations = { en, sv, de, es };

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
  };
  return map[locale] || 'en-US';
}
