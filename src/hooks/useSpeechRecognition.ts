import { useState, useEffect, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { onResult, onError, language = 'zh-TW', continuous = false } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // 檢查瀏覽器是否支援語音識別
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('您的瀏覽器不支援語音識別功能。請使用 Chrome、Edge 或 Safari。');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript;
      const fullTranscript = finalTranscript + interimTranscript;
      setTranscript(fullTranscript);

      if (onResult && finalTranscript) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = '語音識別發生錯誤';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = '沒有偵測到語音，請再試一次';
          break;
        case 'audio-capture':
          errorMessage = '無法存取麥克風，請檢查權限設定';
          break;
        case 'not-allowed':
          errorMessage = '麥克風權限被拒絕，請允許瀏覽器使用麥克風';
          break;
        case 'network':
          errorMessage = '網路連線錯誤';
          break;
        default:
          errorMessage = `語音識別錯誤：${event.error}`;
      }

      setError(errorMessage);
      setIsListening(false);
      
      if (onError) {
        onError(errorMessage);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, onResult, onError]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      finalTranscriptRef.current = '';
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        // 如果已經在運行，忽略錯誤
        console.log('Recognition already started');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const reset = () => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setError(null);
  };

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    reset,
    isSupported: typeof window !== 'undefined' && 
                 (window.SpeechRecognition || (window as any).webkitSpeechRecognition) !== undefined,
  };
}

// 擴展 Window 介面
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  
  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: any) => any) | null;
    onerror: ((this: SpeechRecognition, ev: any) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  }
  
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: any;
  }
  
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
  
  var SpeechRecognition: {
    new (): SpeechRecognition;
  };
  
  var webkitSpeechRecognition: {
    new (): SpeechRecognition;
  };
}

