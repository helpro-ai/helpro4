import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import './ChatWidget.css';
import { useChat } from '../../hooks/useChat';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Chip } from '../ui/Chip';
import { parseUserIntent, draftFromIntent } from '../../utils/nlp';
import { BookingDraft } from '../../types/chat';
import { Drawer } from '../ui/Drawer';

const quickReplies = ['Home', 'Office', 'Hotel', 'Today', 'Weekend'];
const SPEAK_KEY = 'helpro_speak_replies';

function DraftPanel({ draft }: { draft: BookingDraft }) {
  if (!draft.category && !draft.timeHint && !draft.rooms && !draft.hours && !draft.notes) return null;

  return (
    <div className="draft">
      <div className="draft__header">
        <p className="chat__eyebrow">Draft</p>
        <p className="muted">Pulled from your last message.</p>
      </div>
      <ul className="draft__list">
        {draft.category && <li><span>Category</span><strong>{draft.category}</strong></li>}
        {draft.timeHint && <li><span>When</span><strong>{draft.timeHint}</strong></li>}
        {draft.rooms ? <li><span>Rooms</span><strong>{draft.rooms}</strong></li> : null}
        {draft.hours ? <li><span>Hours</span><strong>{draft.hours}</strong></li> : null}
        {draft.notes && <li><span>Notes</span><strong>{draft.notes}</strong></li>}
      </ul>
    </div>
  );
}

export function ChatWidget() {
  const { messages, loading, error, sendMessage, reset } = useChat();
  const [input, setInput] = useState('');
  const [speakReplies, setSpeakReplies] = useState(() => localStorage.getItem(SPEAK_KEY) === 'true');
  const [draftOpen, setDraftOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, partial, start, stop, isSupported: speechSupported } = useSpeechRecognition();
  const { speak, cancel, isSpeaking, isSupported: synthesisSupported } = useSpeechSynthesis();

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    } else if (partial) {
      setInput(prev => prev || partial);
    }
  }, [transcript, partial]);

  useEffect(() => {
    if (!synthesisSupported || !speakReplies) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'assistant') {
      speak(last.content, 'en-US');
    }
  }, [messages, speakReplies, synthesisSupported, speak]);

  const lastUserMessage = useMemo(() => [...messages].reverse().find(m => m.role === 'user'), [messages]);
  const intentSource = input || lastUserMessage?.content || '';
  const intent = useMemo(() => parseUserIntent(intentSource), [intentSource]);
  const draft: BookingDraft = useMemo(() => draftFromIntent(intent, intentSource), [intent, intentSource]);

  const submitMessage = (content: string) => {
    if (!content.trim()) return;
    sendMessage(content.trim());
    setInput('');
    cancel();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitMessage(input);
  };

  const displayValue = isListening && partial ? `${input}` : input;

  const toggleSpeakReplies = () => {
    const next = !speakReplies;
    setSpeakReplies(next);
    localStorage.setItem(SPEAK_KEY, String(next));
  };

  return (
    <div className="chat card">
      <div className="chat__header">
        <div>
          <p className="chat__eyebrow">Assistant</p>
          <h3>Plan your clean</h3>
        </div>
        <div className="chat__actions">
          <IconButton aria-label="Reset chat" onClick={reset}>↺</IconButton>
          {synthesisSupported && (
            <IconButton aria-label="Toggle speech" onClick={toggleSpeakReplies} title="Speak replies">
              {speakReplies ? '🔊' : '🔈'}
            </IconButton>
          )}
        </div>
      </div>

      <div className="chat__body">
        <div className="chat__stream" ref={listRef}>
          {messages.length === 0 && (
            <div className="chat__empty">
              <p>Ask for a home, office, or hotel session. I’ll draft the plan.</p>
              <p className="muted">Voice stays on-device via your browser.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat__message chat__message--${msg.role}`}>
              <div className="chat__bubble" aria-label={`${msg.role} message`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <p className="chat__loading">Thinking...</p>}
          {error && <p className="chat__error">{error}</p>}
        </div>

        <div className="chat__sidebar">
          <DraftPanel draft={draft} />
        </div>
      </div>

      <div className="chat__composer">
        <form className="chat__input" onSubmit={handleSubmit}>
          <input
            value={displayValue}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your space or timing"
            aria-label="Chat input"
          />
          <div className="chat__input-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={isListening ? stop : () => start()}
              disabled={!speechSupported}
              title={speechSupported ? 'Hold to dictate' : 'Speech recognition not supported'}
            >
              {isListening ? 'Stop' : 'Speak'}
            </Button>
            <Button type="submit" disabled={loading} loading={loading}>
              Send
            </Button>
          </div>
        </form>
        <div className="chat__quick">
          {quickReplies.map(reply => (
            <Chip key={reply} onClick={() => submitMessage(reply)}>
              {reply}
            </Chip>
          ))}
        </div>
        <div className="chat__footer-note">
          <label className="chat__speak-toggle">
            <input type="checkbox" checked={speakReplies} onChange={toggleSpeakReplies} disabled={!synthesisSupported} />
            <span>Speak replies</span>
          </label>
          <button className="draft__open" type="button" onClick={() => setDraftOpen(true)}>Open draft</button>
        </div>
      </div>

      <Drawer open={draftOpen} onClose={() => setDraftOpen(false)} title="Draft">
        <DraftPanel draft={draft} />
      </Drawer>
    </div>
  );
}

export default ChatWidget;
