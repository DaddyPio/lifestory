/**
 * 從自傳內容中提取時間軸記事
 */

export interface TimelineItem {
  timeLabel: string; // 時間標籤（例如：26歲、1999年、大學時期）
  year?: number; // 年份（如果可提取）
  summary: string; // 摘要（不超過10個中文字）
  content: string; // 完整內容片段
}

/**
 * 使用 AI 從自傳內容中提取時間軸記事
 */
export async function extractTimelineFromBiography(
  apiKey: string,
  biographyContent: string
): Promise<TimelineItem[]> {
  if (!apiKey || !biographyContent || biographyContent.trim().length === 0) {
    return [];
  }

  try {
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
            content: `你是一位專業的內容分析師。請從個人自傳中提取重要的時間軸記事。

**要求：**
1. 識別自傳中提到的每個重要時間點（年紀、年份、時期等）
2. 為每個時間點提取對應的內容片段
3. 為每個時間點生成不超過 10 個中文字的簡明摘要
4. 按照時間順序排列

**輸出格式（JSON）：**
{
  "timeline": [
    {
      "timeLabel": "26歲",
      "year": 1999,
      "summary": "回役決定",
      "content": "完整的內容片段..."
    }
  ]
}

**重要：**
- 摘要必須嚴格不超過 10 個中文字
- 時間標籤可以是年紀（如「26歲」）、年份（如「1999年」）或時期（如「大學時期」）
- 如果可能，提取年份用於排序
- 只提取有明確時間標記的重要事件`,
          },
          {
            role: 'user',
            content: `請從以下自傳內容中提取時間軸記事：\n\n${biographyContent}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`API 錯誤：${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{}');
    const timeline = result.timeline || [];

    // 驗證和清理摘要長度
    return timeline.map((item: any) => {
      let summary = item.summary || '';
      // 確保摘要不超過 10 個中文字
      if (summary.length > 10) {
        summary = summary.substring(0, 10);
      }
      return {
        timeLabel: item.timeLabel || '',
        year: item.year || undefined,
        summary: summary.trim(),
        content: item.content || '',
      };
    });
  } catch (error) {
    console.error('提取時間軸失敗:', error);
    return [];
  }
}

/**
 * 從時間標籤中提取年份
 */
export function extractYearFromTimeLabel(timeLabel: string, currentYear: number = new Date().getFullYear()): number | null {
  // 嘗試匹配年份（如：1999年、1999）
  const yearMatch = timeLabel.match(/(\d{4})/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }

  // 嘗試從年紀推算年份（如：26歲）
  const ageMatch = timeLabel.match(/(\d+)\s*歲/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    return currentYear - age;
  }

  return null;
}

