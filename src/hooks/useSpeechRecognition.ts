import { useState, useCallback, useRef, useEffect } from 'react';
import { isSpeechRecognitionSupported } from '../utils/speech';
import { getSpeechLang, getLocale } from '../i18n';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !isSpeechRecognitionSupported()) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition: any = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getSpeechLang(getLocale());

    recognition.onresult = (event: any) => {
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

      if (finalTranscript) {
        setTranscript(prev => `${prev} ${finalTranscript}`.trim());
        setPartial('');
      } else {
        setPartial(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('[SpeechRecognition] Error:', event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const start = useCallback((lang?: string) => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setPartial('');
    setError(null);
    try {
      if (lang) recognitionRef.current.lang = lang;
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
    partial,
    error,
    start,
    stop,
    isSupported: isSpeechRecognitionSupported(),
  };
}
