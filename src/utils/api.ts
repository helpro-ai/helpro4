export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  tenantId: string;
  locale: string;
  messages: ChatMessage[];
  context?: Record<string, any>;
  sessionId: string;
}

export interface ChatResponse {
  assistantMessage: string;
  quickActions?: string[];
  nav?: { route: string; label: string };
  requestId: string;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  return data;
}
