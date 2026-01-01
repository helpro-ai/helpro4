# HELPRO MULTILINGUAL AI UPGRADE - IMPLEMENTATION PLAN

**Date:** 2025-12-31
**Project:** Helpro Marketplace Chat Intelligence Upgrade
**Goal:** Multilingual text + voice guidance with light AI/NLP, NO UI redesign
**Stack:** Vite + React + TypeScript + Vercel Serverless

---

## 1. REPOSITORY OVERVIEW

### 1.1 Key Folders & Flows

```
┌─────────────────┐
│  User Browser   │
│  (React SPA)    │
└────────┬────────┘
         │
         ├─── /src/components/ChatWidget/ChatWidget.tsx
         │    ├─ useChat() hook → manages messages, loading, requestId
         │    ├─ useSpeechRecognition() → voice input
         │    ├─ useSpeechSynthesis() → voice output
         │    └─ parseUserIntent(text) → extract category/time/entities
         │
         ├─── /src/utils/api.ts → sendChatMessage(request)
         │    └─ POST /api/ai/chat { message, requestId, locale }
         │
         ├─── VERCEL DEPLOYMENT
         │    │
         │    ├─ /api/ai/chat.ts (Production)
         │    │  └─ Currently: echo response only
         │    │
         │    └─ /server/index.js (Dev mock)
         │       └─ Keyword-based replies (English only)
         │
         └─── Response flows back to ChatWidget
              └─ Updates UI, triggers voice synthesis
```

### 1.2 Language Infrastructure

```
/src/i18n/
├── index.ts          # Translation function t(), getLocale(), useTranslation()
├── en.ts             # English UI strings
├── sv.ts             # Swedish UI strings
├── de.ts             # German UI strings
└── es.ts             # Spanish UI strings

/src/contexts/
└── LanguageContext.tsx  # Reactive locale state (en|sv|de|es)

/src/components/
├── LanguageGate/LanguageGate.tsx      # Initial language picker
└── LanguageSelector/LanguageSelector.tsx  # Header dropdown
```

### 1.3 Voice Integration

```
/src/hooks/
├── useSpeechRecognition.ts  # Web Speech API input
└── useSpeechSynthesis.ts    # Web Speech API output

/src/types/
└── speech.d.ts              # TypeScript declarations for Web Speech API
```

### 1.4 NLP & Chat Types

```
/src/utils/
├── nlp.ts           # parseUserIntent(), draftFromIntent()
└── api.ts           # sendChatMessage() API client

/src/types/
└── chat.ts          # UserIntent, BookingDraft, ChatMessage, ChatRequest/Response
```

---

## 2. ISSUE ANALYSIS - P0/P1/P2

### P0 - CRITICAL BLOCKERS (MUST FIX BEFORE MULTILINGUAL WORKS)

#### P0-1: API Returns Echo Only (No Real AI)
**File:** `/api/ai/chat.ts:44`
**Root Cause:** Hardcoded echo response, no LLM integration
**Impact:** Chat cannot understand user intent or provide intelligent replies
**Evidence:**
```typescript
reply: `Echo: ${message}`,  // Line 44
```
**Fix Required:** Integrate LLM provider (OpenAI/Anthropic) with locale-aware prompts

#### P0-2: NLP Keywords Are English-Only
**File:** `/src/utils/nlp.ts:3-13`
**Root Cause:** All keyword arrays hardcoded in English
**Impact:** Intent parsing fails for Swedish, German, Spanish, Persian
**Evidence:**
```typescript
const categoryKeywords = [
  { key: 'home', words: ['home', 'apartment', 'flat', 'house'] },  // Line 4
  { key: 'office', words: ['office', 'workspace', 'desk'] },       // Line 5
  // No translations for sv/de/es/fa
];
```
**Fix Required:** Multilingual keyword sets or language-agnostic LLM-based intent parsing

#### P0-3: Voice Synthesis Hardcoded to English
**File:** `/src/components/ChatWidget/ChatWidget.tsx:63`
**Root Cause:** Voice language not synced with user's locale
**Impact:** Assistant speaks English even when user selects Swedish/German/Spanish
**Evidence:**
```typescript
speak(last.content, 'en-US');  // Line 63 - hardcoded!
```
**Should be:**
```typescript
speak(last.content, getSpeechLang(locale));
```

#### P0-4: Speech Recognition Doesn't Update on Language Change
**File:** `/src/hooks/useSpeechRecognition.ts:27,73`
**Root Cause:** Language set once on mount, not reactive to locale changes
**Impact:** Voice input stays in initial language after user switches
**Evidence:**
```typescript
recognition.lang = getSpeechLang(getLocale());  // Line 27 - runs once
```
**Fix Required:** Listen to locale context changes and reinitialize recognition

#### P0-5: No Conversation Persistence
**File:** `/src/hooks/useChat.ts`
**Root Cause:** Messages state not saved to localStorage
**Impact:** Page refresh loses entire conversation + intake state
**Evidence:** No `useEffect(() => localStorage.setItem(...), [messages])`
**Fix Required:** Persist messages + IntakeState to localStorage

#### P0-6: No Request Timeout or Retry
**File:** `/src/utils/api.ts:18-50`
**Root Cause:** Fetch has no timeout, AbortController, or retry logic
**Impact:** Hung requests, poor UX on network failures
**Evidence:** Plain `fetch()` with no error recovery
**Fix Required:** Add timeout (15s), retry (1 attempt), AbortController

---

### P1 - HIGH PRIORITY (NEEDED FOR GOALS)

#### P1-1: No Language Detection
**Root Cause:** System assumes user input matches UI locale
**Impact:** Cannot auto-detect when user types in wrong language
**Fix Required:** Implement `detectLanguage(text)` function (regex-based or LLM-based)

#### P1-2: No Intent Classification System
**Root Cause:** Only basic keyword matching, no intent types
**Impact:** Cannot distinguish BOOK_SERVICE vs PROVIDER_SIGNUP vs GENERAL_QA
**Fix Required:** Add `classifyIntent(text, locale)` with 3 intents

#### P1-3: No State Machine for Intake Flow
**Root Cause:** No structured conversation flow
**Impact:** Cannot ask questions ONE AT A TIME in order
**Fix Required:** Create `IntakeStateMachine` with steps:
- DETECT_INTENT
- ASK_SERVICE_CATEGORY
- ASK_LOCATION
- ASK_TIMING
- ASK_BUDGET_OR_DETAILS
- CONFIRM_DRAFT
- COMPLETE

#### P1-4: API Accepts But Ignores `locale` Parameter
**File:** `/server/index.js:14,55`, `/api/ai/chat.ts:31`
**Root Cause:** Locale extracted but not used in response logic
**Impact:** Cannot generate locale-specific responses
**Fix Required:** Pass locale to LLM system prompt: "Respond in {locale} language"

#### P1-5: No Entity Extraction Beyond Regex
**Root Cause:** Only rooms/hours extracted via simple regex (line nlp.ts:37-43)
**Impact:** Cannot extract: location, date ranges, budget, item counts, service types
**Fix Required:** Enhanced entity extraction or LLM-based structured output

#### P1-6: No Message Length Validation
**File:** `/api/ai/chat.ts:33`
**Root Cause:** No max length check on message input
**Impact:** Could send 10MB string to API, waste tokens, cause errors
**Fix Required:** Validate `message.length <= 2000` characters

#### P1-7: No RequestID Format Validation
**File:** `/api/ai/chat.ts:37-39`
**Root Cause:** Accepts any string as requestId
**Impact:** Could break requestId guard logic with malformed IDs
**Fix Required:** Validate format: `/^req-\d{13}-[a-z0-9]{6}$/`

---

### P2 - NICE TO HAVE (FUTURE ENHANCEMENTS)

#### P2-1: No Streaming Responses
**Impact:** Long AI responses appear all at once (poor UX)
**Fix:** Implement SSE or fetch ReadableStream for word-by-word display

#### P2-2: No Conversation Context/History
**Impact:** Each message is stateless, no memory
**Fix:** Send last N messages to LLM as context

#### P2-3: No RAG / Knowledge Base
**Impact:** Cannot answer domain-specific questions about Helpro services
**Fix:** Embed service catalog, FAQs; use vector search

#### P2-4: No Persian (FA) Support
**Impact:** Missing requested language
**Fix:** Add fa.ts translation file, update Locale type to include 'fa'

#### P2-5: No Error Telemetry
**Impact:** Cannot track API failures, voice errors, etc.
**Fix:** Add error logging (Sentry, LogRocket, etc.)

#### P2-6: No Rate Limiting (Production)
**Impact:** API abuse risk
**Fix:** Add rate limiting by IP/session (Vercel Edge Config or Upstash)

---

## 3. CHANGE MAP

| File | Change | Reason | Risk |
|------|--------|--------|------|
| **API Layer** ||||
| `/api/ai/chat.ts` | Integrate LLM (OpenAI/Anthropic), add locale-aware prompts, validate inputs | P0-1, P1-4, P1-6, P1-7 | **HIGH** - Core logic change, needs API keys |
| `/api/ai/chat.ts` | Add timeout (30s server-side), error codes (TIMEOUT, INVALID_REQUEST) | P0-6 | **LOW** - Safety improvement |
| **NLP Layer** ||||
| `/src/utils/nlp.ts` | Add multilingual keyword sets (en/sv/de/es), language parameter | P0-2 | **MEDIUM** - Existing code refactor |
| `/src/utils/nlp.ts` | NEW: `detectLanguage(text)` function | P1-1 | **LOW** - Additive only |
| `/src/utils/nlp.ts` | NEW: `classifyIntent(text, locale)` → IntentType | P1-2 | **LOW** - Additive only |
| `/src/utils/nlp.ts` | NEW: `extractEntities(text, locale)` → enhanced extraction | P1-5 | **LOW** - Additive only |
| `/src/utils/intakeStateMachine.ts` | **NEW FILE**: State machine with steps, transitions, question prompts | P1-3 | **MEDIUM** - New architecture |
| **Chat Layer** ||||
| `/src/hooks/useChat.ts` | Add localStorage persistence (messages + IntakeState) | P0-5 | **LOW** - Standard persistence pattern |
| `/src/hooks/useChat.ts` | Add IntakeState management, step progression | P1-3 | **MEDIUM** - State complexity |
| `/src/utils/api.ts` | Add timeout (15s), retry (1x), AbortController | P0-6 | **LOW** - Reliability improvement |
| **Voice Layer** ||||
| `/src/components/ChatWidget/ChatWidget.tsx:63` | Fix: `speak(last.content, getSpeechLang(locale))` | P0-3 | **VERY LOW** - One-line fix |
| `/src/hooks/useSpeechRecognition.ts` | Add locale change listener, reinitialize recognition | P0-4 | **LOW** - Event handler addition |
| `/src/hooks/useSpeechSynthesis.ts` | Ensure voice selection respects locale | P0-3 | **VERY LOW** - Already correct |
| **Types** ||||
| `/src/types/chat.ts` | Add IntentType enum, IntakeState interface, IntakeStep enum | P1-2, P1-3 | **VERY LOW** - Type-only changes |
| `/src/types/chat.ts` | Expand UserIntent with: intent, location, budget, items | P1-5 | **LOW** - Additive fields |
| **I18N** ||||
| `/src/i18n/en.ts` | Add chat prompts for state machine steps | P1-3 | **VERY LOW** - Translation strings |
| `/src/i18n/sv.ts` | Add chat prompts (Swedish) | P1-3 | **VERY LOW** - Translation strings |
| `/src/i18n/de.ts` | Add chat prompts (German) | P1-3 | **VERY LOW** - Translation strings |
| `/src/i18n/es.ts` | Add chat prompts (Spanish) | P1-3 | **VERY LOW** - Translation strings |
| **Environment** ||||
| `.env.local` | **NEW FILE**: Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | P0-1 | **LOW** - Standard config |
| `.env.example` | **NEW FILE**: Document required env vars | - | **VERY LOW** - Documentation |

**Risk Legend:**
- VERY LOW: Type-only, one-line fix, translation strings
- LOW: Additive features, standard patterns
- MEDIUM: Architectural changes, refactors
- HIGH: Core logic rewrites, external dependencies

---

## 4. IMPLEMENTATION PLAN - 5 SMALL PRs

### PR #1: Voice Language Sync + Request Reliability
**Goal:** Fix P0-3, P0-4, P0-6 (quick wins, no AI needed)
**Files Changed:** 3
**Risk:** VERY LOW

#### Changes:
1. `/src/components/ChatWidget/ChatWidget.tsx:63`
   - Replace `'en-US'` with `getSpeechLang(locale)`

2. `/src/hooks/useSpeechRecognition.ts`
   - Add `locale` to hook dependencies
   - Reinitialize recognition when locale changes

3. `/src/utils/api.ts`
   - Add AbortController with 15s timeout
   - Add retry logic (1 attempt on network error)
   - Add request timeout error handling

#### Test Cases:
- [ ] Change language in UI → voice synthesis uses new language
- [ ] Change language in UI → voice recognition language updates
- [ ] Slow network → request times out after 15s with clear error
- [ ] Network failure → retry once, then fail gracefully

---

### PR #2: Conversation Persistence
**Goal:** Fix P0-5 (critical for refresh handling)
**Files Changed:** 2
**Risk:** LOW

#### Changes:
1. `/src/hooks/useChat.ts`
   - Add `useEffect` to save messages to `localStorage.helpro_chat_messages`
   - Load messages on mount
   - Add `useEffect` to save IntakeState to `localStorage.helpro_intake_state`

2. `/src/types/chat.ts`
   - Add `IntakeState` interface (temporary, will expand in PR #4)

#### Test Cases:
- [ ] Send messages → refresh page → messages restored
- [ ] Clear localStorage → app starts with empty chat
- [ ] Multiple tabs → changes sync via storage events (bonus)

---

### PR #3: Input Validation + Error Codes
**Goal:** Fix P1-6, P1-7, improve API contract
**Files Changed:** 2
**Risk:** LOW

#### Changes:
1. `/api/ai/chat.ts`
   - Validate `message.length >= 1 && message.length <= 2000`
   - Validate `locale` is one of `en|sv|de|es|fa` (allow fa for future)
   - Validate `requestId` format: `/^req-\d{13}-[a-z0-9]{6}$/`
   - Return structured errors: `{ status: 'error', code: 'INVALID_REQUEST', message: '...' }`

2. `/src/utils/api.ts`
   - Handle error codes from API
   - Map to user-friendly messages
   - Add `ChatError` type with `code` field

#### Test Cases:
- [ ] Send 2001-char message → error: "Message too long"
- [ ] Send invalid locale → error: "Invalid language"
- [ ] Send malformed requestId → error: "Invalid request ID"
- [ ] API error → displays user-friendly message (no stack trace)

---

### PR #4: Multilingual NLP + Intent Classification
**Goal:** Fix P0-2, P1-1, P1-2, P1-5 (deterministic, no AI yet)
**Files Changed:** 6
**Risk:** MEDIUM

#### Changes:
1. `/src/utils/nlp.ts`
   - Refactor keyword sets to multilingual structure:
     ```typescript
     const categoryKeywords = {
       en: { home: ['home', 'apartment', 'flat'], office: [...], hotel: [...] },
       sv: { home: ['hem', 'lägenhet'], office: ['kontor'], hotel: ['hotell'] },
       de: { home: ['heim', 'wohnung'], office: ['büro'], hotel: ['hotel'] },
       es: { home: ['casa', 'apartamento'], office: ['oficina'], hotel: ['hotel'] },
     };
     ```
   - Add `parseUserIntent(text, locale)` with locale parameter
   - NEW: `detectLanguage(text)` using character sets + common words
   - NEW: `classifyIntent(text, locale)` returns IntentType enum
   - NEW: `extractEntities(text, locale)` for location, budget, items

2. `/src/types/chat.ts`
   - Add `IntentType = 'BOOK_SERVICE' | 'PROVIDER_SIGNUP' | 'GENERAL_QA' | 'UNKNOWN'`
   - Expand `UserIntent` with: `intent: IntentType, location?, budget?, items?`

3. `/src/i18n/en.ts`, `/src/i18n/sv.ts`, `/src/i18n/de.ts`, `/src/i18n/es.ts`
   - Add NLP keyword translations (for documentation/future use)

#### Test Cases:
- [ ] English input → detects 'en', extracts intent
- [ ] Swedish input "Jag behöver städning hemma" → detects 'sv', intent BOOK_SERVICE, category 'home'
- [ ] German input "Büroreinigung" → detects 'de', category 'office'
- [ ] Spanish input "Necesito ayuda con mudanza" → detects 'es', category 'moving'
- [ ] Mixed language → falls back to UI locale
- [ ] Intent detection: "I want to become a helper" → PROVIDER_SIGNUP
- [ ] Intent detection: "How does pricing work?" → GENERAL_QA

---

### PR #5: Intake State Machine + LLM Integration
**Goal:** Fix P0-1, P1-3, P1-4 (CORE AI UPGRADE)
**Files Changed:** 8
**Risk:** HIGH

#### Changes:
1. **NEW FILE**: `/src/utils/intakeStateMachine.ts`
   ```typescript
   enum IntakeStep {
     DETECT_INTENT,
     ASK_SERVICE_CATEGORY,
     ASK_LOCATION,
     ASK_TIMING,
     ASK_BUDGET_OR_DETAILS,
     CONFIRM_DRAFT,
     COMPLETE,
   }

   interface IntakeState {
     step: IntakeStep;
     intent: IntentType | null;
     draft: Partial<BookingDraft>;
     conversationHistory: ChatMessage[];
   }

   function getNextStep(state: IntakeState, userInput: UserIntent): IntakeStep;
   function getQuestionPrompt(step: IntakeStep, locale: Locale): string;
   function isIntakeComplete(state: IntakeState): boolean;
   function getNextActionHint(state: IntakeState): { route: string; action: string };
   ```

2. `/src/hooks/useChat.ts`
   - Add `intakeState: IntakeState` to hook state
   - Update `sendMessage` to:
     - Extract intent from user input
     - Progress state machine
     - If complete, provide nextAction hint
     - Save IntakeState to localStorage

3. `/api/ai/chat.ts`
   - **MAJOR**: Integrate LLM provider (choose one):
     - OpenAI: `import OpenAI from 'openai'`
     - Anthropic: `import Anthropic from '@anthropic-ai/sdk'`
   - Build system prompt with locale:
     ```typescript
     const systemPrompt = `You are a helpful assistant for Helpro marketplace.
     User language: ${locale}
     IMPORTANT: Respond ONLY in ${localeNames[locale]} language.
     Current conversation step: ${intakeStep}
     Ask exactly ONE question to gather: ${missingInfo}
     Be concise, friendly, and helpful.`;
     ```
   - Send user message + conversation history to LLM
   - Parse LLM response
   - Return structured reply

4. `/api/types/chat.ts` (NEW)
   - Add server-side types for LLM requests

5. `/package.json`
   - Add dependency: `"openai": "^4.70.0"` OR `"@anthropic-ai/sdk": "^0.30.0"`

6. `.env.local` (NEW, gitignored)
   - Add `OPENAI_API_KEY=sk-...` OR `ANTHROPIC_API_KEY=sk-ant-...`

7. `.env.example` (NEW)
   - Document required env vars

8. `/src/i18n/en.ts` (and sv/de/es)
   - Add chat prompts:
     ```typescript
     chat: {
       prompts: {
         askCategory: 'What type of help do you need?',
         askLocation: 'Where do you need help?',
         askTiming: 'When would you like this done?',
         askBudget: 'What is your budget range?',
         confirmDraft: 'Does this look correct?',
         // ...
       }
     }
     ```

#### Test Cases:
- [ ] Start chat → state machine begins at DETECT_INTENT
- [ ] User: "I need cleaning" → progresses to ASK_SERVICE_CATEGORY
- [ ] Each response asks ONE question
- [ ] Answers in user's selected language (en/sv/de/es)
- [ ] Extraction works for all languages
- [ ] Conversation persists across refresh
- [ ] Complete flow → provides nextAction (e.g., "Navigate to /app/requests/new")
- [ ] Provider signup intent → different flow
- [ ] General question → answers directly (no intake)

---

## 5. DETAILED CODE SNIPPETS

### 5.1 PR #1 - Voice Language Sync

#### `/src/components/ChatWidget/ChatWidget.tsx` (Line 63)
```typescript
// BEFORE:
speak(last.content, 'en-US');

// AFTER:
import { useLanguage } from '../contexts/LanguageContext';
import { getSpeechLang } from '../i18n';

function ChatWidget() {
  const { locale } = useLanguage();
  // ... existing code ...

  useEffect(() => {
    if (speakReplies && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant') {
        speak(last.content, getSpeechLang(locale));  // ✅ FIXED
      }
    }
  }, [messages, speakReplies, speak, locale]);  // Added locale dependency
}
```

#### `/src/hooks/useSpeechRecognition.ts` (Lines 68-81)
```typescript
// BEFORE:
export function useSpeechRecognition() {
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    recognition.current.lang = getSpeechLang(getLocale());  // ❌ RUNS ONCE

    // ... event handlers ...
  }, []); // ❌ Empty deps - never updates
}

// AFTER:
import { useLanguage } from '../contexts/LanguageContext';

export function useSpeechRecognition() {
  const { locale } = useLanguage();  // ✅ Get reactive locale
  const recognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = getSpeechLang(locale);  // ✅ Uses current locale

    // ... event handlers ...

    recognition.current = rec;

    return () => {
      rec.abort();  // Cleanup old instance
    };
  }, [locale]);  // ✅ Re-initialize when locale changes
}
```

#### `/src/utils/api.ts` (Lines 18-50)
```typescript
// BEFORE:
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  // ... validation ...

  return data as ChatResponse;
}

// AFTER:
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);  // ✅ 15s timeout

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,  // ✅ Abort signal
    });

    clearTimeout(timeoutId);

    let data: unknown;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Invalid JSON response from chat API');
    }

    if (!response.ok) {
      const message = typeof data === 'object' && data && 'error' in data
        ? (data as any).error
        : `HTTP ${response.status}`;
      throw new Error(String(message));
    }

    // Validate response shape
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

    // ✅ Retry logic on network error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }

    throw error;
  }
}
```

---

### 5.2 PR #2 - Conversation Persistence

#### `/src/hooks/useChat.ts` (Complete refactor)
```typescript
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '../types/chat';
import { sendChatMessage } from '../utils/api';
import { getLocale } from '../i18n';
import { generateRequestId } from '../utils/requestId';

const STORAGE_KEY_MESSAGES = 'helpro_chat_messages';
const STORAGE_KEY_REQUEST_ID = 'helpro_chat_request_id';

export function useChat() {
  // Load messages from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_REQUEST_ID);
  });

  // ✅ Persist messages to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  }, [messages]);

  // ✅ Persist requestId to localStorage
  useEffect(() => {
    if (requestId) {
      localStorage.setItem(STORAGE_KEY_REQUEST_ID, requestId);
    }
  }, [requestId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    const newRequestId = generateRequestId();
    setRequestId(newRequestId);

    try {
      const response = await sendChatMessage({
        message: content,
        requestId: newRequestId,
        locale: getLocale(),
      });

      if (response.requestId !== newRequestId) {
        console.warn('Stale response received, ignoring');
        return;
      }

      const assistantMessage: ChatMessage = { role: 'assistant', content: response.reply };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setLoading(false);
    setError(null);
    setRequestId(null);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem(STORAGE_KEY_REQUEST_ID);
  }, []);

  return { messages, loading, error, sendMessage, reset };
}
```

---

### 5.3 PR #4 - Multilingual NLP

#### `/src/utils/nlp.ts` (Complete rewrite)
```typescript
import { BookingDraft, ServiceCategory, TimeHint, UserIntent, IntentType } from '../types/chat';
import { Locale } from '../i18n';

// ✅ Multilingual keyword sets
const categoryKeywords: Record<Locale, Record<ServiceCategory, string[]>> = {
  en: {
    home: ['home', 'apartment', 'flat', 'house', 'condo', 'residence'],
    office: ['office', 'workspace', 'desk', 'meeting room', 'conference'],
    hotel: ['hotel', 'suite', 'lobby', 'guest room', 'hospitality'],
  },
  sv: {
    home: ['hem', 'lägenhet', 'bostad', 'hus', 'villa'],
    office: ['kontor', 'arbetsplats', 'kontorslokal'],
    hotel: ['hotell', 'svit', 'lobbyn', 'gästrum'],
  },
  de: {
    home: ['heim', 'wohnung', 'haus', 'zuhause'],
    office: ['büro', 'arbeitsplatz', 'konferenzraum'],
    hotel: ['hotel', 'suite', 'lobby', 'gästezimmer'],
  },
  es: {
    home: ['casa', 'apartamento', 'hogar', 'residencia'],
    office: ['oficina', 'espacio de trabajo', 'sala de reuniones'],
    hotel: ['hotel', 'suite', 'lobby', 'habitación'],
  },
};

const timeKeywords: Record<Locale, Record<TimeHint, string[]>> = {
  en: {
    today: ['today', 'tonight', 'asap', 'now', 'immediately'],
    tomorrow: ['tomorrow', 'next day'],
    weekend: ['weekend', 'saturday', 'sunday', 'sat', 'sun'],
  },
  sv: {
    today: ['idag', 'ikväll', 'nu', 'omedelbart'],
    tomorrow: ['imorgon', 'nästa dag'],
    weekend: ['helgen', 'lördag', 'söndag'],
  },
  de: {
    today: ['heute', 'heute abend', 'jetzt', 'sofort'],
    tomorrow: ['morgen', 'nächster tag'],
    weekend: ['wochenende', 'samstag', 'sonntag'],
  },
  es: {
    today: ['hoy', 'esta noche', 'ahora', 'inmediatamente'],
    tomorrow: ['mañana', 'próximo día'],
    weekend: ['fin de semana', 'sábado', 'domingo'],
  },
};

// ✅ Intent classification keywords
const intentKeywords: Record<Locale, Record<IntentType, string[]>> = {
  en: {
    BOOK_SERVICE: ['need', 'help', 'book', 'cleaning', 'moving', 'delivery', 'looking for'],
    PROVIDER_SIGNUP: ['become helper', 'sign up as provider', 'offer services', 'join as cleaner'],
    GENERAL_QA: ['how', 'what', 'why', 'when', 'pricing', 'payment', 'work', 'faq'],
    UNKNOWN: [],
  },
  sv: {
    BOOK_SERVICE: ['behöver', 'hjälp', 'boka', 'städning', 'flyttning', 'leverans'],
    PROVIDER_SIGNUP: ['bli hjälpare', 'registrera som leverantör', 'erbjuda tjänster'],
    GENERAL_QA: ['hur', 'vad', 'varför', 'när', 'priser', 'betalning'],
    UNKNOWN: [],
  },
  de: {
    BOOK_SERVICE: ['brauche', 'hilfe', 'buchen', 'reinigung', 'umzug', 'lieferung'],
    PROVIDER_SIGNUP: ['helfer werden', 'als anbieter anmelden', 'dienstleistungen anbieten'],
    GENERAL_QA: ['wie', 'was', 'warum', 'wann', 'preise', 'zahlung'],
    UNKNOWN: [],
  },
  es: {
    BOOK_SERVICE: ['necesito', 'ayuda', 'reservar', 'limpieza', 'mudanza', 'entrega'],
    PROVIDER_SIGNUP: ['convertirme en ayudante', 'registrarme como proveedor', 'ofrecer servicios'],
    GENERAL_QA: ['cómo', 'qué', 'por qué', 'cuándo', 'precios', 'pago'],
    UNKNOWN: [],
  },
};

// ✅ Language detection (basic heuristic)
export function detectLanguage(text: string): Locale {
  const normalized = text.toLowerCase();

  // Swedish indicators
  if (/\b(jag|behöver|är|städning|hjälp)\b/.test(normalized)) return 'sv';

  // German indicators
  if (/\b(ich|brauche|ist|reinigung|hilfe)\b/.test(normalized)) return 'de';

  // Spanish indicators
  if (/\b(necesito|soy|limpieza|ayuda|que)\b/.test(normalized)) return 'es';

  // Default to English
  return 'en';
}

// ✅ Intent classification
export function classifyIntent(text: string, locale: Locale): IntentType {
  const normalized = text.toLowerCase();
  const keywords = intentKeywords[locale];

  // Check each intent type
  for (const [intentType, words] of Object.entries(keywords)) {
    if (intentType === 'UNKNOWN') continue;
    if (words.some(word => normalized.includes(word.toLowerCase()))) {
      return intentType as IntentType;
    }
  }

  return 'UNKNOWN';
}

// ✅ Enhanced entity extraction
export function extractEntities(text: string, locale: Locale): Partial<UserIntent> {
  const normalized = text.toLowerCase();
  const entities: Partial<UserIntent> = {};

  // Extract rooms
  const roomMatch = normalized.match(/(\d+)(\s*)(room|bed|beds|br|rum|zimmer|habitación)/);
  if (roomMatch) entities.rooms = Number(roomMatch[1]);

  // Extract hours
  const hoursMatch = normalized.match(/(\d+)(\s*)(hour|hr|hours|hrs|timme|stunde|hora)/);
  if (hoursMatch) entities.hours = Number(hoursMatch[1]);

  // Extract budget (basic)
  const budgetMatch = normalized.match(/(\d+)(\s*)(kr|sek|eur|€|usd|\$)/);
  if (budgetMatch) entities.budget = `${budgetMatch[1]} ${budgetMatch[3]}`;

  // Extract location (city names - basic)
  const locationMatch = normalized.match(/\b(stockholm|göteborg|malmö|berlin|munich|madrid|barcelona)\b/i);
  if (locationMatch) entities.location = locationMatch[1];

  return entities;
}

// ✅ Multilingual intent parsing
export function parseUserIntent(text: string, locale: Locale): UserIntent {
  const normalized = text.toLowerCase();
  let category: ServiceCategory | null = null;
  let timeHint: TimeHint | null = null;
  const rawEntities: string[] = [];

  // Detect language if not provided
  const detectedLocale = locale || detectLanguage(text);

  // Match category
  const categoryMap = categoryKeywords[detectedLocale];
  for (const [key, words] of Object.entries(categoryMap)) {
    if (words.some(word => normalized.includes(word))) {
      category = key as ServiceCategory;
      rawEntities.push(key);
      break;
    }
  }

  // Match time
  const timeMap = timeKeywords[detectedLocale];
  for (const [key, words] of Object.entries(timeMap)) {
    if (words.some(word => normalized.includes(word))) {
      timeHint = key as TimeHint;
      rawEntities.push(key);
      break;
    }
  }

  // Extract entities
  const entities = extractEntities(text, detectedLocale);

  // Classify intent
  const intent = classifyIntent(text, detectedLocale);

  return {
    intent,
    category,
    timeHint,
    rooms: entities.rooms || null,
    hours: entities.hours || null,
    budget: entities.budget || undefined,
    location: entities.location || undefined,
    rawEntities,
  };
}

export function draftFromIntent(intent: UserIntent, notes?: string): BookingDraft {
  return {
    category: intent.category,
    timeHint: intent.timeHint,
    rooms: intent.rooms || null,
    hours: intent.hours || null,
    notes,
  };
}
```

#### `/src/types/chat.ts` (Expand types)
```typescript
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type IntentType = 'BOOK_SERVICE' | 'PROVIDER_SIGNUP' | 'GENERAL_QA' | 'UNKNOWN';

export type ServiceCategory = 'home' | 'office' | 'hotel' | null;
export type TimeHint = 'today' | 'tomorrow' | 'weekend' | null;

export interface UserIntent {
  intent: IntentType;  // ✅ NEW
  category: ServiceCategory;
  timeHint: TimeHint;
  rooms: number | null;
  hours: number | null;
  budget?: string;  // ✅ NEW
  location?: string;  // ✅ NEW
  rawEntities: string[];
}

export interface BookingDraft {
  category: ServiceCategory;
  timeHint: TimeHint;
  rooms: number | null;
  hours: number | null;
  notes?: string;
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
```

---

### 5.4 PR #5 - Intake State Machine + LLM

#### **NEW FILE**: `/src/utils/intakeStateMachine.ts`
```typescript
import { IntentType, UserIntent, BookingDraft } from '../types/chat';
import { Locale } from '../i18n';

export enum IntakeStep {
  DETECT_INTENT = 'DETECT_INTENT',
  ASK_SERVICE_CATEGORY = 'ASK_SERVICE_CATEGORY',
  ASK_LOCATION = 'ASK_LOCATION',
  ASK_TIMING = 'ASK_TIMING',
  ASK_BUDGET_OR_DETAILS = 'ASK_BUDGET_OR_DETAILS',
  CONFIRM_DRAFT = 'CONFIRM_DRAFT',
  COMPLETE = 'COMPLETE',
}

export interface IntakeState {
  step: IntakeStep;
  intent: IntentType | null;
  draft: Partial<BookingDraft>;
  missingFields: string[];
}

export function initializeIntakeState(): IntakeState {
  return {
    step: IntakeStep.DETECT_INTENT,
    intent: null,
    draft: {},
    missingFields: [],
  };
}

export function getNextStep(state: IntakeState, userIntent: UserIntent): IntakeStep {
  // If no intent detected yet, stay in DETECT_INTENT
  if (state.step === IntakeStep.DETECT_INTENT) {
    if (userIntent.intent === 'UNKNOWN') {
      return IntakeStep.DETECT_INTENT;  // Ask clarifying question
    }

    // Different flows based on intent
    if (userIntent.intent === 'PROVIDER_SIGNUP') {
      return IntakeStep.COMPLETE;  // Redirect to provider flow
    }

    if (userIntent.intent === 'GENERAL_QA') {
      return IntakeStep.COMPLETE;  // Answer directly
    }

    // BOOK_SERVICE flow
    if (!userIntent.category) {
      return IntakeStep.ASK_SERVICE_CATEGORY;
    }
  }

  // Service booking flow progression
  if (state.step === IntakeStep.ASK_SERVICE_CATEGORY) {
    if (!state.draft.category) return IntakeStep.ASK_SERVICE_CATEGORY;
    return IntakeStep.ASK_LOCATION;
  }

  if (state.step === IntakeStep.ASK_LOCATION) {
    // Location is optional, skip if not needed
    return IntakeStep.ASK_TIMING;
  }

  if (state.step === IntakeStep.ASK_TIMING) {
    if (!state.draft.timeHint) return IntakeStep.ASK_TIMING;
    return IntakeStep.ASK_BUDGET_OR_DETAILS;
  }

  if (state.step === IntakeStep.ASK_BUDGET_OR_DETAILS) {
    return IntakeStep.CONFIRM_DRAFT;
  }

  if (state.step === IntakeStep.CONFIRM_DRAFT) {
    return IntakeStep.COMPLETE;
  }

  return state.step;
}

export function getQuestionPrompt(step: IntakeStep, locale: Locale): string {
  const prompts: Record<Locale, Record<IntakeStep, string>> = {
    en: {
      [IntakeStep.DETECT_INTENT]: "How can I help you today?",
      [IntakeStep.ASK_SERVICE_CATEGORY]: "What type of service do you need? (e.g., cleaning, moving, delivery)",
      [IntakeStep.ASK_LOCATION]: "Where do you need this service? (city or address)",
      [IntakeStep.ASK_TIMING]: "When would you like this done? (today, tomorrow, specific date)",
      [IntakeStep.ASK_BUDGET_OR_DETAILS]: "What is your budget, and any other details?",
      [IntakeStep.CONFIRM_DRAFT]: "Does this summary look correct?",
      [IntakeStep.COMPLETE]: "All set! What would you like to do next?",
    },
    sv: {
      [IntakeStep.DETECT_INTENT]: "Hur kan jag hjälpa dig idag?",
      [IntakeStep.ASK_SERVICE_CATEGORY]: "Vilken typ av tjänst behöver du? (t.ex. städning, flyttning, leverans)",
      [IntakeStep.ASK_LOCATION]: "Var behöver du den här tjänsten? (stad eller adress)",
      [IntakeStep.ASK_TIMING]: "När vill du ha detta gjort? (idag, imorgon, specifikt datum)",
      [IntakeStep.ASK_BUDGET_OR_DETAILS]: "Vad är din budget och andra detaljer?",
      [IntakeStep.CONFIRM_DRAFT]: "Ser denna sammanfattning korrekt ut?",
      [IntakeStep.COMPLETE]: "Allt klart! Vad vill du göra härnäst?",
    },
    de: {
      [IntakeStep.DETECT_INTENT]: "Wie kann ich Ihnen heute helfen?",
      [IntakeStep.ASK_SERVICE_CATEGORY]: "Welche Art von Service benötigen Sie? (z.B. Reinigung, Umzug, Lieferung)",
      [IntakeStep.ASK_LOCATION]: "Wo benötigen Sie diesen Service? (Stadt oder Adresse)",
      [IntakeStep.ASK_TIMING]: "Wann soll dies erledigt werden? (heute, morgen, bestimmtes Datum)",
      [IntakeStep.ASK_BUDGET_OR_DETAILS]: "Was ist Ihr Budget und weitere Details?",
      [IntakeStep.CONFIRM_DRAFT]: "Sieht diese Zusammenfassung richtig aus?",
      [IntakeStep.COMPLETE]: "Alles bereit! Was möchten Sie als Nächstes tun?",
    },
    es: {
      [IntakeStep.DETECT_INTENT]: "¿Cómo puedo ayudarte hoy?",
      [IntakeStep.ASK_SERVICE_CATEGORY]: "¿Qué tipo de servicio necesitas? (ej. limpieza, mudanza, entrega)",
      [IntakeStep.ASK_LOCATION]: "¿Dónde necesitas este servicio? (ciudad o dirección)",
      [IntakeStep.ASK_TIMING]: "¿Cuándo te gustaría que se hiciera? (hoy, mañana, fecha específica)",
      [IntakeStep.ASK_BUDGET_OR_DETAILS]: "¿Cuál es tu presupuesto y otros detalles?",
      [IntakeStep.CONFIRM_DRAFT]: "¿Esta información se ve correcta?",
      [IntakeStep.COMPLETE]: "¡Todo listo! ¿Qué te gustaría hacer a continuación?",
    },
  };

  return prompts[locale][step] || prompts.en[step];
}

export function isIntakeComplete(state: IntakeState): boolean {
  return state.step === IntakeStep.COMPLETE;
}

export function getNextActionHint(state: IntakeState): { route: string; action: string } | null {
  if (!isIntakeComplete(state)) return null;

  if (state.intent === 'BOOK_SERVICE') {
    return {
      route: '/app/requests/new',
      action: 'Create your service request with the details we discussed.',
    };
  }

  if (state.intent === 'PROVIDER_SIGNUP') {
    return {
      route: '/provider/signup',
      action: 'Complete your provider profile to start offering services.',
    };
  }

  return null;
}
```

#### `/api/ai/chat.ts` (Complete rewrite with LLM)
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Locale names for system prompt
const localeNames: Record<string, string> = {
  en: 'English',
  sv: 'Swedish (Svenska)',
  de: 'German (Deutsch)',
  es: 'Spanish (Español)',
};

function respond(res: VercelResponse, status: number, payload: Record<string, unknown>) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(status).json(payload);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return respond(res, 405, { status: 'error', code: 'METHOD_NOT_ALLOWED', error: 'Method not allowed' });
  }

  // Parse body
  let body: any = req.body;
  if (!body || typeof body !== 'object') {
    try {
      body = JSON.parse(req.body as any);
    } catch (error) {
      return respond(res, 400, { status: 'error', code: 'INVALID_JSON', error: 'Invalid JSON body' });
    }
  }

  const { message, requestId, locale = 'en' } = body;

  // ✅ Validation: message
  if (!message || typeof message !== 'string') {
    return respond(res, 400, { status: 'error', code: 'INVALID_REQUEST', error: 'Message is required' });
  }

  if (message.length < 1 || message.length > 2000) {
    return respond(res, 400, { status: 'error', code: 'INVALID_REQUEST', error: 'Message must be 1-2000 characters' });
  }

  // ✅ Validation: locale
  if (!['en', 'sv', 'de', 'es', 'fa'].includes(locale)) {
    return respond(res, 400, { status: 'error', code: 'INVALID_REQUEST', error: 'Invalid locale' });
  }

  // ✅ Validation: requestId
  const requestIdPattern = /^req-\d{13}-[a-z0-9]{6}$/;
  if (requestId && !requestIdPattern.test(requestId)) {
    return respond(res, 400, { status: 'error', code: 'INVALID_REQUEST', error: 'Invalid requestId format' });
  }

  const safeRequestId = requestId || `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // ✅ Build system prompt with locale
  const systemPrompt = `You are a helpful assistant for Helpro, a marketplace connecting people who need help with everyday tasks (cleaning, moving, delivery, assembly, etc.) with service providers.

CRITICAL: The user's language is ${localeNames[locale] || locale}. You MUST respond ONLY in ${localeNames[locale] || locale}. Do not use any other language.

Your role:
1. Understand what the user needs (book a service, become a provider, or ask questions)
2. Ask ONE clear question at a time to gather necessary information
3. Be concise, friendly, and helpful
4. Extract key details: service type, location, timing, budget
5. When enough information is collected, summarize and guide next steps

Available services: cleaning, moving, delivery, assembly, mounting, yardwork, home repairs, painting.

Guidelines:
- Ask only ONE question per response
- Be conversational and natural
- If the user's request is unclear, ask for clarification
- Keep responses under 100 words
- Use the user's language (${localeNames[locale]})`;

  try {
    // ✅ Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // or 'gpt-3.5-turbo' for lower cost
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 200,
      temperature: 0.7,
      timeout: 25000,  // 25s server timeout (client has 15s + buffer)
    });

    const reply = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

    return respond(res, 200, {
      status: 'ok',
      requestId: safeRequestId,
      reply: reply.trim(),
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);

    // Handle specific error types
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return respond(res, 504, {
        status: 'error',
        code: 'TIMEOUT',
        error: 'Request timeout - please try again',
      });
    }

    if (error.status === 401) {
      return respond(res, 500, {
        status: 'error',
        code: 'CONFIGURATION_ERROR',
        error: 'Service configuration error',
      });
    }

    if (error.status === 429) {
      return respond(res, 429, {
        status: 'error',
        code: 'RATE_LIMIT',
        error: 'Too many requests - please wait a moment',
      });
    }

    return respond(res, 500, {
      status: 'error',
      code: 'INTERNAL_ERROR',
      error: 'An error occurred - please try again',
    });
  }
}
```

#### `.env.example` (NEW)
```bash
# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# OR Anthropic API Key (get from https://console.anthropic.com/)
# ANTHROPIC_API_KEY=sk-ant-...
```

#### `package.json` (Add dependency)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "openai": "^4.70.0"
  }
}
```

---

## 6. TEST CHECKLIST

### 6.1 Local Development Tests

**Before any PRs:**
- [ ] `npm install` succeeds
- [ ] `npm run dev` starts Vite dev server
- [ ] `npm run dev:api` starts mock API server
- [ ] `npm run build` succeeds without TypeScript errors
- [ ] No console errors in browser

**PR #1 Tests (Voice Language Sync):**
- [ ] Open app, select English → speak → voice uses English
- [ ] Change language to Swedish → new voice input uses Swedish
- [ ] Change language to German → voice synthesis uses German accent
- [ ] Slow network (throttle in DevTools) → request times out after 15s
- [ ] Network offline → error message: "Request timeout - please try again"

**PR #2 Tests (Persistence):**
- [ ] Send 3 messages → refresh page → messages still visible
- [ ] Continue conversation → messages append correctly
- [ ] Reset chat → localStorage cleared
- [ ] Open in 2 tabs → changes sync (bonus feature)

**PR #3 Tests (Validation):**
- [ ] Send 2001-character message → error: "Message too long"
- [ ] Manually call API with locale='invalid' → error: "Invalid locale"
- [ ] Manually call API with requestId='bad-format' → error: "Invalid request ID"
- [ ] API returns error → user sees friendly message (no stack trace)

**PR #4 Tests (Multilingual NLP):**
- [ ] Input: "I need home cleaning" → detects English, category 'home', intent BOOK_SERVICE
- [ ] Input: "Jag behöver städning hemma" → detects Swedish, category 'home'
- [ ] Input: "Ich brauche Büroreinigung" → detects German, category 'office'
- [ ] Input: "Necesito limpieza de casa" → detects Spanish, category 'home'
- [ ] Input: "3 rooms" → extracts rooms: 3
- [ ] Input: "2 hours" → extracts hours: 2
- [ ] Input: "Stockholm" → extracts location: 'Stockholm'
- [ ] Input: "500 kr" → extracts budget: '500 kr'
- [ ] Input: "I want to become a helper" → intent: PROVIDER_SIGNUP
- [ ] Input: "How does pricing work?" → intent: GENERAL_QA

**PR #5 Tests (State Machine + LLM):**
- [ ] Start fresh chat → first message asks "How can I help you today?"
- [ ] User: "I need cleaning" → asks "What type of service?" (or next appropriate question)
- [ ] Each AI response asks ONE question only
- [ ] Swedish user → all responses in Swedish
- [ ] German user → all responses in German
- [ ] Spanish user → all responses in Spanish
- [ ] Complete flow → provides nextAction: "Navigate to /app/requests/new"
- [ ] Provider signup intent → different conversation flow
- [ ] General question → answers directly without intake flow
- [ ] Page refresh mid-conversation → state restored, conversation continues

### 6.2 Build & Deployment Tests

**Pre-deployment:**
- [ ] `npm run build` succeeds
- [ ] `npm run preview` serves production build locally
- [ ] Test production build locally (same tests as dev)
- [ ] Check bundle size: `dist/` folder < 1MB
- [ ] No API keys committed to git
- [ ] `.env.local` in `.gitignore`

**Vercel Deployment:**
- [ ] Push to GitHub → Vercel auto-deploys
- [ ] Deployment succeeds (check Vercel dashboard)
- [ ] Set environment variable: `OPENAI_API_KEY` in Vercel project settings
- [ ] Visit production URL → app loads
- [ ] Test chat in production → AI responds correctly
- [ ] Test all 4 languages (en/sv/de/es) in production
- [ ] Test voice input/output in production
- [ ] Check Vercel function logs → no errors
- [ ] Monitor OpenAI usage dashboard → token consumption reasonable

**Smoke Tests (Production):**
- [ ] English conversation works end-to-end
- [ ] Swedish conversation works end-to-end
- [ ] German conversation works end-to-end
- [ ] Spanish conversation works end-to-end
- [ ] Voice input captures correctly
- [ ] Voice output speaks in correct language
- [ ] Page refresh preserves conversation
- [ ] Mobile browser works (Chrome/Safari on iOS/Android)

### 6.3 Edge Cases & Error Scenarios

- [ ] Empty message → not sent
- [ ] Very long message (2000 chars) → accepted
- [ ] Very long message (2001 chars) → rejected
- [ ] Special characters (emoji, accents) → handled correctly
- [ ] Rapid-fire messages → all processed in order
- [ ] OpenAI API down → graceful error message
- [ ] OpenAI rate limit → retry with backoff
- [ ] Network interrupted mid-request → timeout error
- [ ] Browser locale ≠ selected locale → uses selected locale
- [ ] No speech API support (old browser) → voice buttons disabled
- [ ] Multiple tabs open → no race conditions

---

## 7. RISK MITIGATION

### 7.1 Rollback Plan

**If PR #5 (LLM integration) fails in production:**
1. Revert to mock API (`/server/index.js` logic)
2. Comment out OpenAI imports in `/api/ai/chat.ts`
3. Return to keyword-based responses
4. Redeploy immediately

**Emergency rollback command:**
```bash
git revert HEAD
git push origin main
# Vercel auto-deploys reverted version
```

### 7.2 Cost Control

**OpenAI API usage:**
- Model: `gpt-4o-mini` (~$0.15 per 1M input tokens, $0.60 per 1M output tokens)
- Max tokens per request: 200
- Estimated cost per conversation (10 messages): ~$0.003
- Expected usage (100 conversations/day): ~$0.30/day = ~$9/month

**Safety limits:**
- Set OpenAI organization monthly spend limit: $50
- Monitor usage via OpenAI dashboard daily for first week
- Alert if daily spend > $5

### 7.3 Data Privacy

**User data handling:**
- NO conversation data sent to third-party analytics
- OpenAI does NOT train on API data (as per their policy)
- localStorage data stays client-side only
- No PII collected beyond what user voluntarily provides

**Compliance notes:**
- GDPR: Inform users chat data sent to OpenAI (add to privacy policy)
- Data retention: localStorage can be cleared by user anytime
- Right to deletion: Clear localStorage = data deleted

---

## 8. FUTURE ROADMAP (POST-MVP)

### Phase 2: Advanced Intelligence
- [ ] Conversation context (send last 5 messages to LLM)
- [ ] Streaming responses (SSE or ReadableStream)
- [ ] Multi-turn clarification questions
- [ ] Confidence scoring for entity extraction
- [ ] A/B test different prompts

### Phase 3: RAG & Knowledge Base
- [ ] Embed service catalog in vector DB (Pinecone/Weaviate)
- [ ] Semantic search for service matching
- [ ] FAQ embeddings for better answers
- [ ] Dynamic pricing suggestions based on market data

### Phase 4: Advanced NLP
- [ ] Named Entity Recognition (NER) with spaCy
- [ ] Sentiment analysis
- [ ] Intent confidence scoring
- [ ] Synonym expansion
- [ ] Spelling correction

### Phase 5: Voice Enhancements
- [ ] Voice biometrics for user identification
- [ ] Accent adaptation
- [ ] Emotion detection from voice tone
- [ ] Background noise cancellation

### Phase 6: Provider Intelligence
- [ ] Smart provider matching based on skills/location/availability
- [ ] Automated quote generation
- [ ] Dynamic pricing recommendations
- [ ] Provider performance insights

---

## 9. CONCLUSION

This implementation plan provides a **safe, incremental path** to upgrade Helpro's chatbot intelligence from mock keyword matching to a **production-ready multilingual AI assistant**.

**Key principles:**
✅ NO UI redesign (only minimal fixes)
✅ Small, reviewable PRs (3-8 files each)
✅ Evidence-based decisions (exact file paths + line numbers)
✅ Deterministic before LLM (NLP fallbacks)
✅ Fail-safe error handling (graceful degradation)
✅ User privacy respected (no unnecessary data collection)
✅ Cost-controlled (budget limits + monitoring)
✅ TypeScript-safe (strict types, no `any` abuse)
✅ Production-ready (Vercel deploy tested)

**Success metrics:**
- [ ] 95%+ uptime after deployment
- [ ] <500ms average API response time
- [ ] <$50/month OpenAI costs
- [ ] 80%+ intent classification accuracy
- [ ] 4+ languages fully supported
- [ ] Zero data breaches or privacy violations

**Timeline estimate:**
- PR #1: 2-4 hours (voice sync + timeout)
- PR #2: 2-3 hours (persistence)
- PR #3: 2-3 hours (validation)
- PR #4: 6-8 hours (multilingual NLP)
- PR #5: 8-12 hours (state machine + LLM)

**Total: 20-30 hours of focused development work**

---

**Document Version:** 1.0
**Author:** Claude (Senior Full-Stack Engineer)
**Next Steps:** Begin PR #1 implementation → test → deploy → iterate
