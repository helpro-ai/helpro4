import ChatWidget from '../components/ChatWidget/ChatWidget';
import '../components/ui/ui.css';

export default function Home() {
  return (
    <div className="page page--center">
      <div className="hero__content" style={{ textAlign: 'center' }}>
        <span className="eyebrow">Helpro Assistant</span>
        <h1>Ask for cleaning help, get a draft in seconds.</h1>
        <p className="lead">Home, office, or hotel—voice or text. Nothing leaves your browser during voice capture.</p>
      </div>
      <div className="chat-shell">
        <ChatWidget />
      </div>
    </div>
  );
}
