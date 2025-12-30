import { useState, useCallback } from 'react';
import { sendChatMessage, ChatMessage, ChatResponse } from '../utils/api';
import { generateRequestId } from '../utils/requestId';
import { getLocale } from '../i18n';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    const requestId = generateRequestId();
    setCurrentRequestId(requestId);

    try {
      const response: ChatResponse = await sendChatMessage({
        message: content.trim(),
        requestId,
        locale: getLocale(),
      });

      // Guard against stale responses
      if (currentRequestId && requestId !== currentRequestId) {
        console.info('[Chat] Ignoring stale response', { requestId, currentRequestId });
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
      setCurrentRequestId(null);
    }
  }, [messages, currentRequestId]);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setLoading(false);
    setCurrentRequestId(null);
  }, []);

  return { messages, loading, error, sendMessage, reset };
}
