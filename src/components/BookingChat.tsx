import { FormEvent, useEffect, useRef, useState } from 'react';
import { addMessage, listMessages } from '../utils/mockDb';
import { Message } from '../types/domain';
import { generateRequestId } from '../utils/requestId';
import './ChatWidget/ChatWidget.css';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { sendChatMessage } from '../utils/api';

const quick = ['On my way', 'Arrived', 'Need access code', 'Running late'];

export function BookingChat({ bookingId }: { bookingId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(listMessages(bookingId));
  }, [bookingId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const submit = (content: string) => {
    if (!content.trim()) return;
    const msg: Message = {
      id: generateRequestId(),
      bookingId,
      senderId: 'local-user',
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(msg);
    setMessages(listMessages(bookingId));
    setInput('');
  };

  const askAI = async () => {
    setLoading(true);
    try {
      const res = await sendChatMessage({ message: `Summarize booking ${bookingId}: ${input}`, requestId: bookingId });
      submit(res.reply);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  return (
    <div className="chat card">
      <div className="chat__header">
        <div>
          <p className="chat__eyebrow">Booking chat</p>
          <h3>Coordinate in real time</h3>
        </div>
      </div>
      <div className="chat__stream" ref={listRef}>
        {messages.map(m => (
          <div key={m.id} className={`chat__message chat__message--${m.senderId === 'local-user' ? 'user' : 'assistant'}`}>
            <div className="chat__bubble">{m.content}</div>
          </div>
        ))}
      </div>
      <div className="chat__composer">
        <form className="chat__input" onSubmit={onSubmit}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Send a message" aria-label="Booking chat input" />
          <div className="chat__input-actions">
            <Button type="button" variant="ghost" onClick={askAI} disabled={loading}>Ask AI</Button>
            <Button type="submit" disabled={loading}>Send</Button>
          </div>
        </form>
        <div className="chat__quick">
          {quick.map(text => (
            <Chip key={text} onClick={() => submit(text)}>{text}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
