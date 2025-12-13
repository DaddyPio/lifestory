import { useState, useEffect, useRef } from 'react';

interface UseSpeechSynthesisOptions {
  onEnd?: () => void;
  onError?: (error: string) => void;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const {
    onEnd,
    onError,
    rate = 0.92, // 稍慢的語速，更自然（ChatGPT 風格）
    pitch = 1.0, // 自然音調
    volume = 0.9, // 適中音量
    voice = null,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // 載入可用的語音
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 尋找最佳中文語音（優先選擇 Neural 語音，更自然）
  const getChineseVoice = (): SpeechSynthesisVoice | null => {
    if (voice) return voice;
    
    // 優先尋找 Neural 語音（更自然，類似 ChatGPT）
    const neuralVoices = voices.filter(
      (v) => (v.lang.startsWith('zh-TW') || v.lang.startsWith('zh-CN')) &&
             (v.name.includes('Neural') || v.name.includes('neural') || v.name.includes('Premium'))
    );
    
    if (neuralVoices.length > 0) {
      // 優先選擇台灣語音
      const taiwanNeural = neuralVoices.find((v) => v.lang.startsWith('zh-TW'));
      if (taiwanNeural) return taiwanNeural;
      return neuralVoices[0];
    }
    
    // 其次尋找台灣中文語音
    const taiwanVoice = voices.find(
      (v) => v.lang.startsWith('zh-TW')
    );
    
    if (taiwanVoice) return taiwanVoice;
    
    // 再次尋找中國中文語音
    const chinaVoice = voices.find(
      (v) => v.lang.startsWith('zh-CN')
    );
    
    if (chinaVoice) return chinaVoice;
    
    // 最後尋找任何中文語音
    const chineseVoice = voices.find((v) => v.lang.startsWith('zh'));
    
    return chineseVoice || null;
  };

  const speak = (text: string) => {
    if (!text.trim()) return;

    // 停止當前語音
    window.speechSynthesis.cancel();

    // 優化文字，讓語音更自然（在標點符號後添加空格，幫助語音引擎識別停頓）
    const processedText = text
      .replace(/([，。？！；：])/g, '$1 ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(processedText);
    const selectedVoice = getChineseVoice();
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = 'zh-TW';

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (onEnd) {
        onEnd();
      }
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      const errorMessage = `語音播放錯誤：${event.error}`;
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return {
    isSpeaking,
    isPaused,
    error,
    voices,
    speak,
    pause,
    resume,
    stop,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
}

