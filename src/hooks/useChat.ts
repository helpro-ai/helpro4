import { useState, useCallback, useEffect, useRef } from 'react';
import { sendChatMessage, ChatMessage, ChatResponse, ConversationState } from '../utils/api';
import { generateRequestId } from '../utils/requestId';
import { useLanguage } from '../contexts/LanguageContext';
import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  loadConversationState,
  saveConversationState,
  clearConversationState,
} from '../utils/storage';

export function useChat() {
  const { locale } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory<ChatMessage>());
  const [conversationState, setConversationState] = useState<ConversationState | null>(() =>
    loadConversationState<ConversationState>()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  // Persist conversation state whenever it changes
  useEffect(() => {
    if (conversationState) {
      saveConversationState(conversationState);
    }
  }, [conversationState]);

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
        locale,
        conversationState,
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

      // Update conversation state from response
      if (response.conversationState) {
        setConversationState(response.conversationState);
      }

      console.info('[Chat] Message sent successfully', { requestId, state: response.conversationState });
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error('[Chat] Error sending message', err);
    } finally {
      setLoading(false);
      currentRequestIdRef.current = null;
    }
  }, [locale, conversationState]);

  const reset = useCallback(() => {
    setMessages([]);
    setConversationState(null);
    setError(null);
    setLoading(false);
    currentRequestIdRef.current = null;
    clearChatHistory();
    clearConversationState();
  }, []);

  return { messages, loading, error, sendMessage, reset, conversationState };
}
