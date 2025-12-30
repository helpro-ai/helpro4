export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  requestId?: string;
  locale?: string;
}

export interface ChatResponse {
  status: 'ok';
  requestId: string;
  reply: string;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error('Invalid JSON response from chat API');
  }

  if (!response.ok) {
    const message = typeof data === 'object' && data && 'error' in data ? (data as any).error : `HTTP ${response.status}`;
    throw new Error(String(message));
  }

  if (
    !data ||
    typeof data !== 'object' ||
    (data as any).status !== 'ok' ||
    typeof (data as any).reply !== 'string' ||
    typeof (data as any).requestId !== 'string'
  ) {
    throw new Error('Malformed response from chat API');
  }

  return data as ChatResponse;
}
