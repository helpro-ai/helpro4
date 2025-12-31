import { useState } from 'react';
import './LanguageGate.css';
import { Locale, useTranslation } from '../../i18n';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onComplete: () => void;
}

const LANG_OPTIONS: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'sv', label: 'Svenska' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
];

export default function LanguageGate({ onComplete }: Props) {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Locale>(locale);
  const [remember, setRemember] = useState(true);

  const handleContinue = () => {
    setLocale(selected, remember);
    onComplete();
  };

  return (
    <div className="language-gate">
      <Card className="language-gate__card animate-scale-in">
        <h1>{t('language.title')}</h1>
        <p className="language-gate__subtitle">{t('language.subtitle')}</p>

        <div className="language-gate__options">
          {LANG_OPTIONS.map(option => (
            <label key={option.code} className={`language-gate__option ${selected === option.code ? 'active' : ''}`}>
              <input
                type="radio"
                name="language"
                value={option.code}
                checked={selected === option.code}
                onChange={() => setSelected(option.code)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        <label className="language-gate__remember">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          {t('language.remember')}
        </label>

        <div className="language-gate__actions">
          <Button onClick={handleContinue}>{t('language.continue')}</Button>
          <Button variant="ghost" onClick={onComplete}>Skip</Button>
        </div>

        <div className="language-gate__note">
          <Input placeholder="Optional: Invite code" aria-label="Invite code" />
          <small>We are in preview. Invite codes unlock beta-only features.</small>
        </div>
      </Card>
    </div>
  );
}
