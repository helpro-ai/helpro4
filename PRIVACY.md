# Privacy Policy

## Data Collection

### What We Store
**Client-Side (localStorage)**:
- Chat conversation history
- Conversation state (intent, service selection, user inputs)
- Language preference
- Last active timestamp

**Server-Side**:
- None (stateless API)
- Logs contain only:
  - Request IDs (UUIDs)
  - Timestamps
  - Intent classification results
  - No user messages in production logs (PII scrubbing enabled)

### What We Don't Store
- User messages are NOT persisted on servers
- No conversation history database
- No tracking cookies
- No third-party analytics

## Data Processing

### Google OAuth
When you sign in with Google:
- Google ID token verified server-side
- Email extracted for session identification
- No password storage (delegated to Google)
- Google's privacy policy applies: https://policies.google.com/privacy

### Python NLP Service (Optional)
If enabled via `NLP_URL`:
- Processes messages in-memory only
- Does NOT store requests (`NLP_STORE_REQUESTS=false` by default)
- Logs contain no user text (request IDs only)
- Runs on your infrastructure (self-hosted)

### JavaScript NLP (Fallback)
- Processes messages client-side in browser
- No external API calls
- Pure regex and keyword matching

## Your Rights (GDPR-Inspired)

### Data Access
- All your data is stored in your browser's localStorage
- Open DevTools > Application > Local Storage to view
- Stored under keys: `helpro_chat_history`, `helpro_conversation_state`

### Data Deletion
```javascript
// Clear chat history
localStorage.removeItem('helpro_chat_history');
localStorage.removeItem('helpro_conversation_state');

// Or use the UI Reset button
```

### Data Portability
- Export chat history: Open DevTools Console, run:
```javascript
JSON.parse(localStorage.getItem('helpro_chat_history') || '[]')
```

### Data Minimization
- We collect only what's necessary for service function
- No email marketing lists
- No user profiling
- No behavioral tracking

## Third-Party Services

### Google OAuth (accounts.google.com)
- Used only for authentication
- Subject to Google's privacy policy
- We receive: email, name (if shared)
- We don't store tokens beyond session

### Vercel (Hosting - vercel.com)
- Hosts frontend and API functions
- May log requests (IP, user agent) per their policy
- Subject to Vercel's privacy policy: https://vercel.com/legal/privacy-policy

## Data Retention

- **Client-side**: Until you clear browser data or click Reset
- **Server-side**: Logs rotated every 30 days (standard practice)
- **No long-term storage**: System is stateless by design

## Children's Privacy

- Service not intended for users under 13
- No special data collection for children
- Parents may clear browser data to remove any stored information

## Changes to This Policy

- Policy effective: 2026-01-01
- Changes published to this file with git commit history
- Major changes announced via GitHub releases

## Contact

Questions about privacy? Open an issue at:
https://github.com/yourusername/helpro4/issues

Or email: privacy@helpro.app

## Technical Implementation

### PII Scrubbing (Production)
```javascript
// Log sanitization
if (process.env.NODE_ENV === 'production') {
  meta.message = meta.message.substring(0, 20) + '...';
}
```

### localStorage Contents
```json
{
  "helpro_chat_history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "helpro_conversation_state": {
    "step": "ASK_LOCATION",
    "intent": "BOOK_SERVICE",
    "uiLocale": "en"
  }
}
```

### How to Disable Data Storage
Modify `src/utils/storage.ts`:
```typescript
// Disable persistence
export function saveChatHistory(messages: ChatMessage[]) {
  // return; // Uncomment to disable
  localStorage.setItem('helpro_chat_history', JSON.stringify(messages));
}
```

## Compliance

This privacy notice aligns with:
- GDPR principles (EU)
- CCPA principles (California)
- Data minimization standards
- Transparency requirements

Not a substitute for legal review in your jurisdiction.
