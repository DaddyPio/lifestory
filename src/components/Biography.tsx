import { useState, useEffect } from 'react';
import { LifeEntry, BiographyState } from '../types';
import { extractTimelineFromBiography } from '../services/timelineExtractor';
import { generateSummary } from '../services/summaryService';

interface BiographyProps {
  entries: LifeEntry[];
  apiKey: string;
  biography: BiographyState | null;
  onBiographyUpdate: (biography: BiographyState) => void;
  onEntriesUpdate?: (updates: Array<{ id: string; summary: string }>) => void;
}

export default function Biography({
  entries,
  apiKey,
  biography,
  onBiographyUpdate,
  onEntriesUpdate,
}: BiographyProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [timelineSummaries, setTimelineSummaries] = useState<{ [key: string]: string }>({});
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);

  // 檢查是否需要重新生成
  const needsRegeneration = () => {
    if (!biography) return true;
    
    // 檢查是否有新的內容
    const currentEntryIds = entries.map((e) => e.id).sort().join(',');
    const biographyEntryIds = biography.entryIds.sort().join(',');
    
    return currentEntryIds !== biographyEntryIds;
  };

  // 自動生成或更新自傳
  useEffect(() => {
    if (entries.length > 0 && apiKey && apiKey.trim() && needsRegeneration()) {
      generateBiography();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, apiKey]);

  // 為時間軸摘要生成 AI 摘要（只在需要時生成，並保存到 entry.summary）
  useEffect(() => {
    if (!apiKey || !biography || entries.length === 0) return;

    const generateTimelineSummaries = async () => {
      // 檢查是否有需要生成摘要的條目（沒有摘要且內容較長）
      const entriesToSummarize = entries.filter(
        (entry) => 
          entry.content && 
          entry.content.trim().length > 20 && 
          !entry.summary
      );

      if (entriesToSummarize.length === 0) {
        // 所有條目都有摘要，不需要生成
        return;
      }

      setIsGeneratingSummaries(true);
      const summariesToUpdate: Array<{ id: string; summary: string }> = [];

      for (const entry of entriesToSummarize) {
        try {
          const summary = await generateSummary({
            apiKey,
            content: entry.content,
            maxLength: 20, // 限制為20個中文字
          });
          
          // 保存摘要到條目中（通過回調函數更新 entry.summary）
          summariesToUpdate.push({ id: entry.id, summary });
          
          // 同時更新本地狀態以便立即顯示
          setTimelineSummaries((prev) => ({ ...prev, [entry.id]: summary }));
        } catch (error) {
          console.error(`為條目 ${entry.id} 生成摘要失敗:`, error);
          // 如果生成失敗，使用簡單截取作為後備
          const cleanContent = entry.content.trim().replace(/\s+/g, ' ');
          let fallbackSummary = cleanContent.substring(0, 20);
          // 嘗試在標點符號處截斷
          const lastPunctuation = Math.max(
            fallbackSummary.lastIndexOf('，'),
            fallbackSummary.lastIndexOf('。'),
            fallbackSummary.lastIndexOf('、'),
            fallbackSummary.lastIndexOf('；')
          );
          if (lastPunctuation > 10) {
            fallbackSummary = fallbackSummary.substring(0, lastPunctuation + 1);
          }
          const finalSummary = fallbackSummary + '...';
          summariesToUpdate.push({ id: entry.id, summary: finalSummary });
          setTimelineSummaries((prev) => ({ ...prev, [entry.id]: finalSummary }));
        }
      }

      // 批量更新 entries 的 summary 字段
      if (summariesToUpdate.length > 0 && onEntriesUpdate) {
        onEntriesUpdate(summariesToUpdate);
      }
      
      setIsGeneratingSummaries(false);
    };

    generateTimelineSummaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, biography, entries.map(e => `${e.id}-${e.content}`).join(',')]); // 只在 entry 內容變化時重新生成

  const generateBiography = async () => {
    if (!apiKey || entries.length === 0) {
      setError('請先輸入 API Key 並記錄一些內容');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // 按時間排序（優先使用年紀或時期，而不是輸入時間）
      const sortedEntries = [...entries].sort((a, b) => {
        // 優先按年紀排序（年紀是數值，可以直接比較）
        if (a.age !== undefined && b.age !== undefined) {
          return a.age - b.age;
        }
        if (a.age !== undefined) return -1; // 有年紀的排在前面
        if (b.age !== undefined) return 1;

        // 如果都沒有年紀，嘗試按時期排序
        if (a.period && b.period) {
          // 定義時期的優先順序
          const periodOrder: { [key: string]: number } = {
            '幼兒時期': 1,
            '小學時期': 2,
            '國中時期': 3,
            '高中時期': 4,
            '大學時期': 5,
            '研究所時期': 6,
            '工作初期': 7,
            '工作中期': 8,
            '工作後期': 9,
            '退休時期': 10,
          };
          
          const aOrder = periodOrder[a.period] || 999;
          const bOrder = periodOrder[b.period] || 999;
          
          if (aOrder !== bOrder) {
            return aOrder - bOrder;
          }
          
          // 如果不在預定義列表中，按字母順序
          return a.period.localeCompare(b.period, 'zh-TW');
        }
        if (a.period) return -1;
        if (b.period) return 1;
        
        // 如果都沒有年紀和時期，才按輸入時間排序（作為最後的排序依據）
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      // 確保使用所有記錄（不過濾任何內容）
      const allEntries = sortedEntries.filter(entry => entry.content && entry.content.trim().length > 0);
      
      if (allEntries.length === 0) {
        setError('沒有有效的記錄內容，請先記錄一些生活片段');
        setIsGenerating(false);
        return;
      }

      // 建立時間軸描述（包含所有記錄）
      const timelineDescription = allEntries
        .map((entry, index) => {
          let timeLabel = '';
          if (entry.age) {
            timeLabel = `${entry.age} 歲`;
          } else if (entry.period) {
            timeLabel = entry.period;
          } else {
            timeLabel = `記錄 ${index + 1}`;
          }
          
          return `【${timeLabel}】\n${entry.content.trim()}`;
        })
        .join('\n\n');

      // 建立 prompt（明確要求整合所有內容）
      const prompt = `請根據以下 ${allEntries.length} 個生活片段，撰寫一篇完整的個人自傳。

**重要要求：**
1. **必須整合所有 ${allEntries.length} 個生活片段的內容**，不能遺漏任何一個
2. 使用第一人稱（我）
3. 風格溫暖、有故事感，但清楚、有段落
4. 按照時間順序組織內容（從最早到最晚）
5. 將不同時期的內容自然融合，形成流暢的敘事
6. 長度約 1000-1500 字
7. 以段落方式呈現，每個段落之間空一行
8. 確保每個生活片段的主要內容都有在自傳中體現

**生活片段（共 ${allEntries.length} 個）：**
${timelineDescription}

${biography ? `\n**注意：**以下是之前生成的自傳，請在此基礎上整合所有新舊內容，確保包含上述所有 ${allEntries.length} 個生活片段：\n${biography.content}\n\n請更新自傳，確保包含所有內容。` : ''}

請開始撰寫個人自傳，確保整合所有 ${allEntries.length} 個生活片段：`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                '你是一位專業的傳記作家，擅長將生活片段轉化為溫暖、有故事感的個人傳記。你善於整合新舊內容，保持敘事的連貫性和流暢性。**重要：你必須確保整合所有提供的生活片段，不能遺漏任何內容。**',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      }).catch((fetchError) => {
        // 處理網路錯誤
        if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
          throw new Error('無法連接到 OpenAI API。請檢查：\n1. 網路連線是否正常\n2. API Key 是否正確\n3. 瀏覽器是否允許跨域請求');
        }
        throw fetchError;
      });

      if (!response.ok) {
        let errorMessage = `API 錯誤：${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
            // 常見錯誤的友好提示
            if (errorMessage.includes('Invalid API key')) {
              errorMessage = 'API Key 無效，請檢查是否正確輸入';
            } else if (errorMessage.includes('insufficient_quota')) {
              errorMessage = 'API Key 餘額不足，請充值後再試';
            } else if (errorMessage.includes('rate_limit')) {
              errorMessage = '請求過於頻繁，請稍後再試';
            }
          }
        } catch (e) {
          // 無法解析錯誤回應，使用預設訊息
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      if (!content) {
        throw new Error('未收到生成內容');
      }

      // 從自傳內容中提取時間軸記事
      let timelineItems: BiographyState['timelineItems'] = [];
      try {
        timelineItems = await extractTimelineFromBiography(apiKey, content);
      } catch (error) {
        console.error('提取時間軸失敗:', error);
        // 即使提取失敗，也繼續保存自傳
      }

      // 確保保存所有使用的 entry IDs
      const newBiography: BiographyState = {
        content,
        lastUpdated: new Date(),
        entryIds: allEntries.map((e) => e.id), // 使用實際用於生成的所有 entry IDs
        timelineItems, // 保存提取的時間軸記事
      };

      onBiographyUpdate(newBiography);
    } catch (err) {
      console.error('生成自傳錯誤:', err);
      let errorMessage = '生成傳記時發生錯誤';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!biography) return;
    
    try {
      await navigator.clipboard.writeText(biography.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('複製失敗，請手動選取文字複製');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">你的個人自傳</h1>
          {biography && (
            <p className="text-sm text-gray-500 mt-1">
              最後更新：{new Date(biography.lastUpdated).toLocaleString('zh-TW')}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {isGenerating && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">
              {biography ? 'AI 正在更新你的自傳…' : 'AI 正在整理你的故事…'}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={generateBiography}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                重試
              </button>
              <button
                onClick={() => setError('')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        )}

        {!isGenerating && biography && (
          <div className="space-y-6">
            {/* 時間軸摘要 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">時間軸摘要</h2>
              
              {isGeneratingSummaries && (
                <div className="mb-4 text-sm text-gray-500 text-center">
                  正在生成摘要...
                </div>
              )}
              
              <div className="space-y-3">
                {(() => {
                  // 按時間排序（年紀或時期）
                  const sortedEntries = [...entries]
                    .filter((entry) => entry.content && entry.content.trim().length > 0)
                    .sort((a, b) => {
                      if (a.age !== undefined && b.age !== undefined) {
                        return a.age - b.age;
                      }
                      if (a.age !== undefined) return -1;
                      if (b.age !== undefined) return 1;
                      
                      if (a.period && b.period) {
                        const periodOrder: { [key: string]: number } = {
                          '幼兒時期': 1, '小學時期': 2, '國中時期': 3, '高中時期': 4,
                          '大學時期': 5, '研究所時期': 6, '工作初期': 7, '工作中期': 8,
                          '工作後期': 9, '退休時期': 10,
                        };
                        const aOrder = periodOrder[a.period] || 999;
                        const bOrder = periodOrder[b.period] || 999;
                        if (aOrder !== bOrder) return aOrder - bOrder;
                        return a.period.localeCompare(b.period, 'zh-TW');
                      }
                      if (a.period) return -1;
                      if (b.period) return 1;
                      
                      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    });

                  return sortedEntries.map((entry) => {
                    let timeLabel = '';
                    if (entry.age !== undefined) {
                      timeLabel = `${entry.age} 歲`;
                    } else if (entry.period) {
                      timeLabel = entry.period;
                    } else {
                      timeLabel = new Date(entry.createdAt).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'short',
                      });
                    }

                    // 使用 AI 生成的摘要（優先使用 entry.summary，這是持久化的摘要）
                    const getSummary = (entry: LifeEntry): string => {
                      // 優先使用 entry 中保存的摘要（這是持久化的，不會重複生成）
                      if (entry.summary) {
                        // 確保不超過20字
                        return entry.summary.length > 20 ? entry.summary.substring(0, 20) + '...' : entry.summary;
                      }
                      // 其次使用臨時生成的摘要（正在生成時顯示）
                      if (timelineSummaries[entry.id]) {
                        return timelineSummaries[entry.id];
                      }
                      // 如果內容很短（少於等於20字），直接返回
                      const cleanContent = entry.content.trim().replace(/\s+/g, ' ');
                      if (cleanContent.length <= 20) return cleanContent;
                      // 否則顯示簡單截取（等待 AI 生成）
                      return cleanContent.substring(0, 20) + '...';
                    };
                    
                    const summary = getSummary(entry);

                    return (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-600">
                          {timeLabel}
                        </div>
                        <div className="flex-1 text-sm text-gray-700 line-clamp-2">
                          {summary}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* 自傳內容 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">完整自傳</h2>
              <div className="prose max-w-none">
                {biography.content.split('\n\n').map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-gray-800 leading-relaxed mb-4 whitespace-pre-line"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={generateBiography}
                disabled={isGenerating}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                重新生成
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {copied ? '已複製！' : '複製全文到剪貼簿'}
              </button>
            </div>
          </div>
        )}

        {!isGenerating && !biography && entries.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">請先記錄一些生活片段，系統會自動生成你的自傳。</p>
          </div>
        )}
      </div>
    </div>
  );
}

