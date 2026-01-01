import { createContext, useContext, useState, type ReactNode } from 'react';
import { Locale } from '../i18n';
import { getLanguage, setLanguage as storeLanguage } from '../utils/storage';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale, remember?: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = getLanguage();
    return (stored as Locale) || 'en';
  });

  const setLocale = (newLocale: Locale, remember: boolean = true) => {
    setLocaleState(newLocale);
    storeLanguage(newLocale, remember);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
