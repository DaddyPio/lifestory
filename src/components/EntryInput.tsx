import { useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { LifeEntry } from '../types';

interface EntryInputProps {
  onSave: (entry: Omit<LifeEntry, 'id' | 'timestamp' | 'createdAt'>) => void;
}

export default function EntryInput({ onSave }: EntryInputProps) {
  const [content, setContent] = useState('');
  const [age, setAge] = useState<string>('');
  const [period, setPeriod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 語音識別
  const {
    isListening,
    transcript,
    error: recognitionError,
    startListening,
    stopListening,
    reset: resetRecognition,
    isSupported: isRecognitionSupported,
  } = useSpeechRecognition({
    onResult: (text) => {
      setContent((prev) => prev + (prev ? ' ' : '') + text);
    },
    language: 'zh-TW',
    continuous: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('請輸入內容');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        content: content.trim(),
        age: age ? parseInt(age) : undefined,
        period: period.trim() || undefined,
      });

      // 清空表單
      setContent('');
      setAge('');
      setPeriod('');
      resetRecognition();
    } catch (error) {
      console.error('保存失敗:', error);
      alert('保存失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetRecognition();
      startListening();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">記錄生活片段</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 時間標籤 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              年紀（選填）
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="例如：20"
              min="0"
              max="150"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
              時期（選填）
            </label>
            <input
              id="period"
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="例如：大學時期、高中時期"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* 內容輸入 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            內容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="記錄你的生活片段、回憶、想法..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
          
          {/* 語音輸入按鈕 */}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleListening}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isListening ? (
                <>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span>停止錄音</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                  <span>語音輸入</span>
                </>
              )}
            </button>
            
            {!isRecognitionSupported && (
              <span className="text-xs text-gray-500">（您的瀏覽器不支援語音輸入）</span>
            )}
          </div>

          {/* 語音識別結果 */}
          {isListening && transcript && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">正在識別：</span>
                {transcript}
              </p>
            </div>
          )}

          {/* 錯誤訊息 */}
          {recognitionError && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{recognitionError}</p>
            </div>
          )}
        </div>

        {/* 提交按鈕 */}
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500">
        💡 提示：你可以隨時記錄生活中的任何片段，系統會自動整理成你的個人自傳。
      </p>
    </div>
  );
}

