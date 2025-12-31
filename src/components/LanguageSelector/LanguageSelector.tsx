import { useState, useRef, useEffect } from 'react';
import { Locale } from '../../i18n';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import './LanguageSelector.css';

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGES.find(lang => lang.code === locale) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale, true);
    setIsOpen(false);
  };

  return (
    <div className="language-selector" ref={dropdownRef}>
      <Button
        variant="secondary"
        size="sm"
        aria-label="Select language"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
      </Button>
      {isOpen && (
        <div className="language-selector__dropdown">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`language-selector__option ${locale === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="language-selector__flag">{lang.flag}</span>
              <span className="language-selector__label">{lang.label}</span>
              {locale === lang.code && <span className="language-selector__check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
