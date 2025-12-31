import { useState, useCallback, useEffect, useRef } from 'react';
import { sendChatMessage, ChatMessage, ChatResponse } from '../utils/api';
import { generateRequestId } from '../utils/requestId';
import { getLocale } from '../i18n';
import { loadChatHistory, saveChatHistory, clearChatHistory } from '../utils/storage';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory<ChatMessage>());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    const requestId = generateRequestId();
    currentRequestIdRef.current = requestId;

    try {
      const response: ChatResponse = await sendChatMessage({
        message: content.trim(),
        requestId,
        locale: getLocale(),
      });

      // Guard against stale responses
      if (currentRequestIdRef.current !== requestId) {
        console.info('[Chat] Ignoring stale response', { requestId, current: currentRequestIdRef.current });
        return;
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.reply,
      };

      setMessages(prev => [...prev, assistantMessage]);
      console.info('[Chat] Message sent successfully', { requestId });
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('[Chat] Error sending message', err);
    } finally {
      setLoading(false);
      currentRequestIdRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setLoading(false);
    currentRequestIdRef.current = null;
    clearChatHistory();
  }, []);

  return { messages, loading, error, sendMessage, reset };
}
