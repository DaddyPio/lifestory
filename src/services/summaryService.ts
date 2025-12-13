/**
 * 摘要生成服務
 * 使用 OpenAI API 從完整內容中生成簡明扼要的摘要
 */

export interface SummaryOptions {
  apiKey: string;
  content: string;
  maxLength?: number; // 最大字數，預設 30
}

/**
 * 使用 AI 生成摘要
 */
export async function generateSummary({
  apiKey,
  content,
  maxLength = 30,
}: SummaryOptions): Promise<string> {
  if (!apiKey || !content || content.trim().length === 0) {
    return '';
  }

  // 如果內容已經很短，直接返回
  const cleanContent = content.trim().replace(/\s+/g, ' ');
  if (cleanContent.length <= maxLength) {
    return cleanContent;
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
            content: `你是一位專業的摘要生成助手。請將用戶提供的生活記事內容，濃縮成簡明扼要的摘要，不超過 ${maxLength} 字。摘要應該：
1. 保留最重要的核心信息
2. 簡潔明瞭，一語中的
3. 使用繁體中文
4. 不要使用「...」或省略號`,
          },
          {
            role: 'user',
            content: `請為以下內容生成不超過 ${maxLength} 字的簡明摘要：\n\n${cleanContent}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 錯誤：${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content?.trim() || '';

    // 如果 AI 生成的摘要太長，截斷它
    if (summary.length > maxLength) {
      return summary.substring(0, maxLength) + '...';
    }

    return summary || cleanContent.substring(0, maxLength) + '...';
  } catch (error) {
    console.error('生成摘要失敗:', error);
    // 如果 AI 生成失敗，回退到簡單截取
    return cleanContent.substring(0, maxLength) + '...';
  }
}

/**
 * 批量生成摘要（用於多個條目）
 */
export async function generateSummaries(
  apiKey: string,
  contents: string[],
  maxLength = 30
): Promise<string[]> {
  // 為了避免過多 API 調用，可以並行處理，但要注意速率限制
  const promises = contents.map((content) =>
    generateSummary({ apiKey, content, maxLength })
  );
  return Promise.all(promises);
}

