import ChatWidget from '../components/ChatWidget/ChatWidget';
import '../components/ui/ui.css';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { catalog } from '../data/catalog';

export default function Home() {
  return (
    <div className="page page--center">
      <div className="hero__content" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Helpro Assistant</span>
        <h1>Ask for cleaning help, get a draft in seconds.</h1>
        <p className="lead">Home, office, or hotel—voice or text. Nothing leaves your browser during voice capture.</p>
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
