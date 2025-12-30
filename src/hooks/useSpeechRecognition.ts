import { useState, useCallback, useRef, useEffect } from 'react';
import { isSpeechRecognitionSupported } from '../utils/speech';
import { getSpeechLang, getLocale } from '../i18n';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      setError('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = getSpeechLang(getLocale());

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('[SpeechRecognition] Error:', event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setError(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      console.error('[SpeechRecognition] Start error:', err);
      setError(err.message);
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err: any) {
      console.error('[SpeechRecognition] Stop error:', err);
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    start,
    stop,
    isSupported: isSpeechRecognitionSupported(),
  };
}
