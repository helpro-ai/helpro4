import { FormEvent, useEffect, useRef, useState } from 'react';
import './ChatWidget.css';
import { useChat } from '../../hooks/useChat';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

export function ChatWidget() {
  const { messages, loading, error, sendMessage, reset } = useChat();
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, start, stop, isSupported: speechSupported } = useSpeechRecognition();
  const { speak, cancel, isSpeaking, isSupported: synthesisSupported } = useSpeechSynthesis();

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    cancel();
  };

  return (
    <div className="chat">
      <div className="chat__header">
        <div>
          <p className="chat__eyebrow">AI Assistant</p>
          <h3>Get quick help</h3>
        </div>
        <div className="chat__actions">
          <IconButton aria-label="Reset chat" onClick={reset}>♻️</IconButton>
          {synthesisSupported && (
            <IconButton aria-label="Toggle speech" onClick={() => {
              const last = messages.length ? messages[messages.length - 1]?.content : '';
              return isSpeaking ? cancel() : speak(last);
            }}>
              {isSpeaking ? '🔇' : '🔊'}
            </IconButton>
          )}
        </div>
      </div>

      <div className="chat__messages" ref={listRef}>
        {messages.length === 0 && (
          <div className="chat__empty">
            <p>Ask about moving, deliveries, recycling, or any Helpro feature.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat__message chat__message--${msg.role}`}>
            <div className="chat__bubble">{msg.content}</div>
          </div>
        ))}
        {loading && <p className="chat__loading">Thinking...</p>}
        {error && <p className="chat__error">{error}</p>}
      </div>

      <form className="chat__input" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          aria-label="Chat input"
        />
        <div className="chat__input-actions">
          {speechSupported && (
            <Button type="button" variant="ghost" onClick={isListening ? stop : start}>
              {isListening ? 'Stop' : 'Speak'}
            </Button>
          )}
          <Button type="submit" disabled={loading} loading={loading}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ChatWidget;
