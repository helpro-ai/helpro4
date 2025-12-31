export function shouldShowLanguageGate(): boolean {
  const local = localStorage.getItem('helpro_language');
  const session = sessionStorage.getItem('helpro_language');
  return !local && !session;
}

export function getLanguage(): string | null {
  return localStorage.getItem('helpro_language') || sessionStorage.getItem('helpro_language');
}

export function setLanguage(lang: string, remember: boolean): void {
  if (remember) {
    localStorage.setItem('helpro_language', lang);
    sessionStorage.removeItem('helpro_language');
  } else {
    sessionStorage.setItem('helpro_language', lang);
    localStorage.removeItem('helpro_language');
  }
}

export function getSessionId(): string | null {
  return localStorage.getItem('helpro_sessionId') || sessionStorage.getItem('helpro_sessionId');
}

export function setSessionId(id: string, remember: boolean): void {
  if (remember) {
    localStorage.setItem('helpro_sessionId', id);
    sessionStorage.removeItem('helpro_sessionId');
  } else {
    sessionStorage.setItem('helpro_sessionId', id);
    localStorage.removeItem('helpro_sessionId');
  }
}

export function clearSession(): void {
  localStorage.removeItem('helpro_sessionId');
  sessionStorage.removeItem('helpro_sessionId');
}

// Chat history persistence
const CHAT_HISTORY_KEY = 'helpro_chat_v1';
const INTAKE_STATE_KEY = 'helpro_intake_v1';

export function loadChatHistory<T = any>(): T[] {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('[Storage] Failed to load chat history:', error);
    return [];
  }
}

export function saveChatHistory<T = any>(messages: T[]): void {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch (error) {
    console.warn('[Storage] Failed to save chat history:', error);
  }
}

export function clearChatHistory(): void {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.warn('[Storage] Failed to clear chat history:', error);
  }
}

// Intake state persistence
export function loadIntakeState<T = any>(): T | null {
  try {
    const stored = localStorage.getItem(INTAKE_STATE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.warn('[Storage] Failed to load intake state:', error);
    return null;
  }
}

export function saveIntakeState<T = any>(state: T): void {
  try {
    localStorage.setItem(INTAKE_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('[Storage] Failed to save intake state:', error);
  }
}

export function clearIntakeState(): void {
  try {
    localStorage.removeItem(INTAKE_STATE_KEY);
  } catch (error) {
    console.warn('[Storage] Failed to clear intake state:', error);
  }
}
