import { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import {
  generateNextQuestion,
  generateSectionOpeningQuestion,
  getAllSections,
  ConversationMessage,
} from '../services/interviewService';

// 此組件已不再使用，保留僅供參考
interface InterviewProps {
  apiKey: string;
  answers: any[];
  onAnswerChange: (questionId: string, answer: string) => void;
  onGoToReview: () => void;
}

interface ConversationBubble {
  type: 'question' | 'answer';
  content: string;
  timestamp: Date;
  questionId?: string; // 用於追蹤問題
}

export default function Interview({
  apiKey,
  answers,
  onAnswerChange,
  onGoToReview,
}: InterviewProps) {
  const sections = getAllSections();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSection = sections[currentSectionIndex];
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('');
  const [localAnswer, setLocalAnswer] = useState('');
  const [conversation, setConversation] = useState<ConversationBubble[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [, setIsAutoPlaying] = useState(false);
  const [sectionQuestionCount, setSectionQuestionCount] = useState(0);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const hasAskedQuestionRef = useRef(false);
  const questionCounterRef = useRef(0);

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
      setLocalAnswer(text);
      if (currentQuestionId) {
        onAnswerChange(currentQuestionId, text);
      }
    },
    language: 'zh-TW',
    continuous: true,
  });

  // 語音合成
  const {
    isSpeaking,
    speak,
    stop: stopSpeaking,
    isSupported: isSynthesisSupported,
  } = useSpeechSynthesis({
    onEnd: () => {
      setIsAutoPlaying(false);
    },
    rate: 0.92,
    pitch: 1.0,
    volume: 0.9,
  });

  // 初始化：生成第一個問題
  useEffect(() => {
    if (currentSection && !currentQuestion && !isLoadingQuestion) {
      loadNextQuestion(true);
    }
  }, [currentSectionIndex]);

  // 載入下一個問題
  const loadNextQuestion = async (isSectionStart = false) => {
    if (!currentSection || !apiKey) return;

    setIsLoadingQuestion(true);
    try {
      let question: string;
      let shouldMoveToNext = false;

      if (isSectionStart) {
        // 生成章節開場問題
        const previousSummary = generatePreviousSectionsSummary();
        question = await generateSectionOpeningQuestion(
          apiKey,
          currentSection,
          previousSummary
        );
      } else {
        // 生成下一個問題
        const result = await generateNextQuestion(
          apiKey,
          currentSection,
          conversationHistory,
          sectionQuestionCount
        );
        question = result.question;
        shouldMoveToNext = result.shouldMoveToNextSection;
      }

      const questionId = `q-${Date.now()}-${questionCounterRef.current++}`;
      setCurrentQuestion(question);
      setCurrentQuestionId(questionId);
      setLocalAnswer(answers.find((a) => a.questionId === questionId)?.answer || '');
      hasAskedQuestionRef.current = true;

      // 添加到對話記錄
      const questionBubble: ConversationBubble = {
        type: 'question',
        content: question,
        timestamp: new Date(),
        questionId,
      };
      setConversation((prev) => [...prev, questionBubble]);
      setConversationHistory((prev) => [...prev, { role: 'assistant', content: question }]);

      // 播放問題
      if (isSynthesisSupported) {
        setIsAutoPlaying(true);
        speak(question);
      }

      // 更新問題計數
      if (!isSectionStart) {
        setSectionQuestionCount((prev) => prev + 1);
      } else {
        setSectionQuestionCount(1);
      }

      // 如果應該進入下一個章節
      if (shouldMoveToNext && !isSectionStart) {
        setTimeout(() => {
          moveToNextSection();
        }, 2000); // 等待 2 秒後進入下一個章節
      }
    } catch (error) {
      console.error('生成問題失敗:', error);
      alert('生成問題時發生錯誤，請重試');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // 生成之前章節的摘要
  const generatePreviousSectionsSummary = (): string => {
    if (currentSectionIndex === 0) return '';
    
      const previousAnswers = answers.filter(() => {
        // 這裡可以根據 questionId 判斷屬於哪個章節
        // 簡化版本：返回所有之前的回答
        return true;
      });

    if (previousAnswers.length === 0) return '';

    return `受訪者已經分享了以下內容：
${previousAnswers.map((a) => `- ${a.answer.substring(0, 100)}${a.answer.length > 100 ? '...' : ''}`).join('\n')}`;
  };

  // 進入下一個章節
  const moveToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestion('');
      setCurrentQuestionId('');
      setLocalAnswer('');
      setSectionQuestionCount(0);
      hasAskedQuestionRef.current = false;
    } else {
      // 所有章節完成
      onGoToReview();
    }
  };

  // 當有回答時，更新對話記錄
  useEffect(() => {
    if (localAnswer && hasAskedQuestionRef.current && currentQuestionId) {
      setConversation((prev) => {
        // 檢查是否已經有這個問題的回答
        const lastAnswer = prev.filter((m) => m.type === 'answer' && m.questionId === currentQuestionId).pop();
        if (lastAnswer && lastAnswer.content === localAnswer) {
          return prev;
        }
        
        // 移除舊的回答（如果有的話）
        const filtered = prev.filter((m) => !(m.type === 'answer' && m.questionId === currentQuestionId));
        
        return [
          ...filtered,
          {
            type: 'answer',
            content: localAnswer,
            timestamp: new Date(),
            questionId: currentQuestionId,
          },
        ];
      });

      // 更新對話歷史（用於生成下一個問題）
      setConversationHistory((prev) => {
        // 移除舊的回答（如果有的話）
        const filtered = prev.filter((_, idx) => {
          // 保留最後一個 assistant 訊息之後的所有訊息，但移除最後一個 user 訊息（如果存在）
          if (idx === prev.length - 1 && prev[idx].role === 'user') {
            return false;
          }
          return true;
        });
        
        return [...filtered, { role: 'user', content: localAnswer }];
      });
    }
  }, [localAnswer, currentQuestionId]);

  // 自動滾動到對話底部
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleAnswerChange = (value: string) => {
    setLocalAnswer(value);
    if (currentQuestionId) {
      onAnswerChange(currentQuestionId, value);
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

  const handleReplayQuestion = () => {
    if (currentQuestion) {
      stopSpeaking();
      speak(currentQuestion);
    }
  };

  const handleNext = async () => {
    if (!localAnswer.trim()) {
      alert('請先回答問題');
      return;
    }

    stopListening();
    stopSpeaking();
    resetRecognition();

    // 載入下一個問題
    await loadNextQuestion(false);
  };

  const handleSkipSection = () => {
    if (confirm('確定要跳過這個章節嗎？')) {
      moveToNextSection();
    }
  };

  const progress = ((currentSectionIndex + 1) / sections.length) * 100;
  const isLastSection = currentSectionIndex === sections.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">人生小傳 MVP</h1>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              章節 {currentSectionIndex + 1} / {sections.length}：{currentSection?.title}
            </span>
            <button
              onClick={onGoToReview}
              className="text-blue-600 hover:text-blue-700 underline text-xs"
            >
              查看所有回答
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Section Title */}
          {currentSection && (
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{currentSection.title}</h2>
              {currentSection.description && (
                <p className="text-sm text-gray-500 mt-1">{currentSection.description}</p>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoadingQuestion && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-600">正在思考下一個問題...</p>
            </div>
          )}

          {/* Conversation Messages */}
          <div className="space-y-4">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === 'question' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'question'
                      ? 'bg-blue-100 text-gray-900'
                      : 'bg-green-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString('zh-TW', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={conversationEndRef} />
          </div>

          {/* Current Answer Input */}
          {currentQuestion && !isLoadingQuestion && (
            <div className="mt-4">
              <textarea
                value={localAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="你的回答會顯示在上方對話中..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white"
              />
            </div>
          )}

          {/* Error Messages */}
          {recognitionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{recognitionError}</p>
            </div>
          )}

          {/* Browser Support Warning */}
          {(!isRecognitionSupported || !isSynthesisSupported) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ 您的瀏覽器可能不完全支援語音功能。建議使用 Chrome、Edge 或 Safari。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Voice Controls */}
      {currentQuestion && !isLoadingQuestion && (
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Voice Control Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleReplayQuestion}
                disabled={isSpeaking}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSpeaking ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>播放中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>重新播放問題</span>
                  </>
                )}
              </button>

              <button
                onClick={handleToggleListening}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
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
                    <span>開始語音回答</span>
                  </>
                )}
              </button>
            </div>

            {/* Transcript Display */}
            {isListening && transcript && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">正在識別：</span>
                  {transcript}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2 border-t border-gray-200">
              {currentSection?.optional && (
                <button
                  onClick={handleSkipSection}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  跳過此章節
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!localAnswer.trim() || isLoadingQuestion}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLastSection ? '完成訪談' : '下一題'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
