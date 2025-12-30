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
