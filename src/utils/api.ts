export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationState {
  step: string;
  intent?: string;
  segment?: string; // 'home' | 'office' | 'hotel' for quick actions
  serviceId?: string;
  customServiceId?: string;
  customServiceDraft?: {
    name?: string;
    groupId?: string;
    locale?: string;
  };
  location?: string;
  timing?: string;
  scope?: {
    rooms?: number;
    hours?: number;
    items?: number;
  };
  budget?: string;
  servicesOffered?: string[];
  area?: string;
  availability?: string;
}

export interface ChatRequest {
  message: string;
  requestId?: string;
  locale?: string;
  conversationState?: ConversationState | null;
}

export interface ChatResponse {
  status: 'ok';
  requestId: string;
  reply: string;
  conversationState?: ConversationState;
  suggestedActions?: string[];
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  // Create AbortController for 15s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout specifically
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw error;
  }
}
