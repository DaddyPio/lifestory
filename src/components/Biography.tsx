import { useState, useEffect } from 'react';
import { LifeEntry, BiographyState } from '../types';

interface BiographyProps {
  entries: LifeEntry[];
  apiKey: string;
  biography: BiographyState | null;
  onBiographyUpdate: (biography: BiographyState) => void;
}

export default function Biography({
  entries,
  apiKey,
  biography,
  onBiographyUpdate,
}: BiographyProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

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
    if (entries.length > 0 && apiKey && needsRegeneration()) {
      generateBiography();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, apiKey]);

  const generateBiography = async () => {
    if (!apiKey || entries.length === 0) {
      setError('請先輸入 API Key 並記錄一些內容');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // 按時間排序（年紀或時期，如果都沒有則按輸入時間）
      const sortedEntries = [...entries].sort((a, b) => {
        // 優先按年紀排序
        if (a.age !== undefined && b.age !== undefined) {
          return a.age - b.age;
        }
        if (a.age !== undefined) return -1;
        if (b.age !== undefined) return 1;
        
        // 其次按輸入時間排序
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      // 建立時間軸描述
      const timelineDescription = sortedEntries
        .map((entry, index) => {
          let timeLabel = '';
          if (entry.age) {
            timeLabel = `${entry.age} 歲`;
          } else if (entry.period) {
            timeLabel = entry.period;
          } else {
            timeLabel = `記錄 ${index + 1}`;
          }
          
          return `【${timeLabel}】\n${entry.content}`;
        })
        .join('\n\n');

      // 建立 prompt
      const prompt = `請根據以下生活片段，撰寫一篇完整的個人自傳。要求：

1. 使用第一人稱（我）
2. 風格溫暖、有故事感，但清楚、有段落
3. 按照時間順序組織內容
4. 將不同時期的內容自然融合，形成流暢的敘事
5. 長度約 1000-1500 字
6. 以段落方式呈現，每個段落之間空一行
7. 如果內容有更新，請整合新舊內容，保持敘事的連貫性

生活片段：
${timelineDescription}

${biography ? '\n以下是之前生成的自傳，請在此基礎上整合新內容：\n' + biography.content : ''}

請開始撰寫或更新個人自傳：`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                '你是一位專業的傳記作家，擅長將生活片段轉化為溫暖、有故事感的個人傳記。你善於整合新舊內容，保持敘事的連貫性和流暢性。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `API 錯誤：${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      if (!content) {
        throw new Error('未收到生成內容');
      }

      const newBiography: BiographyState = {
        content,
        lastUpdated: new Date(),
        entryIds: entries.map((e) => e.id),
      };

      onBiographyUpdate(newBiography);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成傳記時發生錯誤');
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
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={generateBiography}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              重試
            </button>
          </div>
        )}

        {!isGenerating && biography && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
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
