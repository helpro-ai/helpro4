import { useState, useCallback } from 'react';
import { sendChatMessage, ChatMessage, ChatResponse } from '../utils/api';
import { getSessionId, setSessionId } from '../utils/storage';
import { getLocale } from '../i18n';
import { generateRequestId } from '../utils/requestId';

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

    let sessionId = getSessionId();
    if (!sessionId) {
      sessionId = `session-${Date.now()}`;
      setSessionId(sessionId, false);
    }

    try {
      const response: ChatResponse = await sendChatMessage({
        tenantId: 'demo-tenant',
        locale: getLocale(),
        messages: [...messages, userMessage],
        sessionId,
      });

      // Guard against stale responses
      if (currentRequestId && requestId !== currentRequestId) {
        console.info('[Chat] Ignoring stale response', { requestId, currentRequestId });
        return;
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.assistantMessage,
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
