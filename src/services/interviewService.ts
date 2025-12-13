/**
 * 動態訪談服務
 * 使用 OpenAI API 根據回答內容生成下一個問題
 */

export interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
}

export interface SectionGoal {
  id: string;
  title: string;
  description: string;
  goals: string[]; // 這個章節要收集的資訊目標
  minQuestions?: number; // 最少問題數
  maxQuestions?: number; // 最多問題數
  optional?: boolean; // 是否為選填章節
}

export const sectionGoals: SectionGoal[] = [
  {
    id: 'intro',
    title: '開場與現在的自己',
    description: '讓我們先從現在的你開始認識',
    goals: [
      '了解受訪者目前的基本狀況（工作、家庭、居住地、年齡等）',
      '了解受訪者對現階段生活的感受和想法',
      '建立輕鬆的訪談氛圍',
    ],
    minQuestions: 2,
    maxQuestions: 4,
  },
  {
    id: 'childhood',
    title: '童年與成長背景',
    description: '回顧你的成長歷程',
    goals: [
      '了解受訪者的成長環境和家鄉',
      '了解家庭背景和家庭關係',
      '了解童年時的重要回憶和經歷',
      '了解成長過程中的影響因素',
    ],
    minQuestions: 3,
    maxQuestions: 5,
  },
  {
    id: 'career',
    title: '職涯與成就',
    description: '分享你的工作與成就',
    goals: [
      '了解受訪者的職業和工作經歷',
      '了解職涯中的重要成就和里程碑',
      '了解工作對受訪者的意義',
      '了解職涯中的挑戰和學習',
    ],
    minQuestions: 3,
    maxQuestions: 5,
  },
  {
    id: 'turningPoints',
    title: '人生轉折點',
    description: '那些改變你人生的重要時刻',
    goals: [
      '了解人生中的重要轉折點',
      '了解影響人生軌跡的重要決定',
      '了解如何面對和克服困難',
      '了解這些轉折點帶來的影響和成長',
    ],
    minQuestions: 3,
    maxQuestions: 5,
  },
  {
    id: 'values',
    title: '價值觀與信念',
    description: '什麼對你來說最重要',
    goals: [
      '了解受訪者的核心價值觀',
      '了解受訪者希望留下的印象和影響',
      '了解指導人生的人生哲學或座右銘',
      '了解價值觀如何影響生活決策',
    ],
    minQuestions: 3,
    maxQuestions: 5,
  },
  {
    id: 'messageToFamily',
    title: '給家人的話',
    description: '想對家人說的話',
    goals: [
      '了解受訪者想對家人表達的話',
      '了解想留給未來家人的訊息',
      '了解對家人的感謝、愛意或故事',
    ],
    minQuestions: 1,
    maxQuestions: 3,
    optional: true,
  },
];

/**
 * 生成下一個問題
 */
export async function generateNextQuestion(
  apiKey: string,
  currentSection: SectionGoal,
  conversationHistory: ConversationMessage[],
  sectionQuestionCount: number
): Promise<{ question: string; shouldMoveToNextSection: boolean }> {
  const systemPrompt = `你是一位專業、溫暖、有同理心的訪談者，正在進行一場深度的人物專訪。你的任務是根據受訪者的回答，自然地提出下一個問題。

當前章節：${currentSection.title}
章節目標：${currentSection.description}
需要收集的資訊：
${currentSection.goals.map((goal, i) => `${i + 1}. ${goal}`).join('\n')}

訪談原則：
1. 問題要自然、流暢，像朋友聊天一樣，不要制式化
2. 根據受訪者的回答，提出深入、有針對性的問題
3. 如果受訪者提到有趣或重要的細節，可以追問更多
4. 問題要簡潔明確，一次問一個重點
5. 語氣要溫暖、親切，讓受訪者感到被理解
6. 避免重複問已經回答過的問題
7. 如果受訪者回答很簡短，可以引導他分享更多細節
8. 如果受訪者回答很詳細，可以針對某個點深入探討

判斷是否完成當前章節的標準：
- 已經收集到足夠的資訊來達成章節目標
- 已經問了至少 ${currentSection.minQuestions || 2} 個問題
- 受訪者的回答已經涵蓋了章節的主要目標

請根據對話歷史，生成下一個問題。如果判斷當前章節已經完成，請在問題前加上 "[完成章節]" 標記。

只返回問題本身，不要添加任何其他說明或格式。`;

  const userPrompt = `以下是目前的對話歷史：

${conversationHistory
  .map((msg) => `${msg.role === 'assistant' ? '訪談者' : '受訪者'}: ${msg.content}`)
  .join('\n\n')}

當前章節已問了 ${sectionQuestionCount} 個問題。

請生成下一個問題：`;

  try {
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
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.8, // 稍高的溫度讓問題更自然多樣
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API 錯誤：${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const question = data.choices[0]?.message?.content?.trim() || '';

    if (!question) {
      throw new Error('未收到生成的問題');
    }

    // 檢查是否應該進入下一個章節
    const shouldMoveToNextSection = question.startsWith('[完成章節]');
    const cleanQuestion = shouldMoveToNextSection
      ? question.replace(/^\[完成章節\]\s*/, '').trim()
      : question;

    return {
      question: cleanQuestion || question,
      shouldMoveToNextSection,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 生成章節的開場問題
 */
export async function generateSectionOpeningQuestion(
  apiKey: string,
  section: SectionGoal,
  previousSectionsSummary?: string
): Promise<string> {
  const systemPrompt = `你是一位專業、溫暖、有同理心的訪談者，正在進行一場深度的人物專訪。你的任務是為新的章節生成一個自然的開場問題。

當前章節：${section.title}
章節目標：${section.description}
需要收集的資訊：
${section.goals.map((goal, i) => `${i + 1}. ${goal}`).join('\n')}

開場問題的要求：
1. 要自然、親切，像朋友聊天一樣
2. 要能引導受訪者進入這個主題
3. 不要制式化，要有溫度
4. 問題要簡潔明確

只返回問題本身，不要添加任何其他說明或格式。`;

  const userPrompt = previousSectionsSummary
    ? `以下是之前章節的摘要：
${previousSectionsSummary}

請為「${section.title}」這個新章節生成一個自然的開場問題。`
    : `請為「${section.title}」這個章節生成一個自然的開場問題。`;

  try {
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
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API 錯誤：${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const question = data.choices[0]?.message?.content?.trim() || '';

    if (!question) {
      throw new Error('未收到生成的問題');
    }

    return question;
  } catch (error) {
    throw error;
  }
}

/**
 * 取得章節目標
 */
export function getSectionGoal(sectionId: string): SectionGoal | undefined {
  return sectionGoals.find((s) => s.id === sectionId);
}

/**
 * 取得所有章節
 */
export function getAllSections(): SectionGoal[] {
  return sectionGoals;
}

