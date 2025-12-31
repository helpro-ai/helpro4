import ChatWidget from '../components/ChatWidget/ChatWidget';
import '../components/ui/ui.css';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { catalog } from '../data/catalog';
import { useTranslation } from '../i18n';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="page page--center">
      <div className="hero__content" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Helpro Assistant</span>
        <h1>{t('home.heroTitle')}</h1>
        <p className="lead">{t('home.heroSubtitle')}</p>
        <div className="hero__actions" style={{ justifyContent: 'center' }}>
          <Button size="lg" onClick={() => { window.location.hash = '#/app/requests/new'; }}>Post a request</Button>
          <Button variant="secondary" size="lg" onClick={() => { window.location.hash = '#/services'; }}>Browse services</Button>
        </div>
      </div>
      <div className="chat-shell">
        <ChatWidget />
      </div>
      <div className="grid">
        {catalog.slice(0, 4).map(cat => (
          <Card key={cat.id}>
            <p className="eyebrow">{cat.icon} {cat.label}</p>
            <h3>{cat.description}</h3>
            <p className="muted">{cat.subcategories?.join(' • ')}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
