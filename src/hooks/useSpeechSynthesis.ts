import { useState, useCallback } from 'react';
import { isSpeechSynthesisSupported } from '../utils/speech';

function pickVoice(lang?: string): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  if (lang) {
    const exact = voices.find(v => v.lang?.toLowerCase() === lang.toLowerCase());
    if (exact) return exact;
    const partial = voices.find(v => v.lang?.toLowerCase().startsWith(lang.toLowerCase().split('-')[0]));
    if (partial) return partial;
  }

  return voices.find(v => v.default) || voices[0];
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string, lang?: string) => {
    if (!isSpeechSynthesisSupported()) return;
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else if (lang) {
      utterance.lang = lang;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (!isSpeechSynthesisSupported()) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported: isSpeechSynthesisSupported(),
  };
}
