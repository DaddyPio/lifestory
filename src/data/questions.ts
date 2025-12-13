export type SectionId =
  | "intro"
  | "childhood"
  | "career"
  | "turningPoints"
  | "values"
  | "messageToFamily";

export interface Question {
  id: string;
  sectionId: SectionId;
  order: number;
  title: string; // 問題主文
  hint?: string; // 補充說明
  optional?: boolean;
}

export interface Section {
  id: SectionId;
  title: string;
  description?: string;
}

export const sections: Section[] = [
  {
    id: "intro",
    title: "開場與現在的自己",
    description: "讓我們先從現在的你開始認識",
  },
  {
    id: "childhood",
    title: "童年與成長背景",
    description: "回顧你的成長歷程",
  },
  {
    id: "career",
    title: "職涯與成就",
    description: "分享你的工作與成就",
  },
  {
    id: "turningPoints",
    title: "人生轉折點",
    description: "那些改變你人生的重要時刻",
  },
  {
    id: "values",
    title: "價值觀與信念",
    description: "什麼對你來說最重要",
  },
  {
    id: "messageToFamily",
    title: "給家人的話",
    description: "想對家人說的話",
  },
];

export const questions: Question[] = [
  // 開場與現在的自己
  {
    id: "intro-1",
    sectionId: "intro",
    order: 1,
    title: "請簡單介紹現在的自己",
    hint: "可以描述你現在的工作、家庭狀況、所在城市、年齡等基本資訊",
  },
  {
    id: "intro-2",
    sectionId: "intro",
    order: 2,
    title: "你目前的生活狀態如何？",
    hint: "你對現在的生活滿意嗎？有什麼特別想分享的？",
  },

  // 童年與成長背景
  {
    id: "childhood-1",
    sectionId: "childhood",
    order: 3,
    title: "你是在哪裡長大的？",
    hint: "描述你的家鄉、居住環境，以及那個地方對你的影響",
  },
  {
    id: "childhood-2",
    sectionId: "childhood",
    order: 4,
    title: "你的家庭背景是什麼樣子？",
    hint: "可以談談你的父母、兄弟姐妹，以及家庭氛圍",
  },
  {
    id: "childhood-3",
    sectionId: "childhood",
    order: 5,
    title: "童年時有什麼特別難忘的回憶？",
    hint: "可以是快樂的、困難的，或對你影響深遠的經歷",
  },

  // 職涯與成就
  {
    id: "career-1",
    sectionId: "career",
    order: 6,
    title: "你目前從事什麼工作？或曾經做過什麼工作？",
    hint: "描述你的職業、工作內容，以及你為什麼選擇這條路",
  },
  {
    id: "career-2",
    sectionId: "career",
    order: 7,
    title: "在你的職涯中，有什麼讓你感到驕傲的成就？",
    hint: "可以是具體的專案、獲得的認可，或對他人的幫助",
  },
  {
    id: "career-3",
    sectionId: "career",
    order: 8,
    title: "工作對你來說意味著什麼？",
    hint: "工作在你人生中扮演什麼角色？",
  },

  // 人生轉折點
  {
    id: "turningPoints-1",
    sectionId: "turningPoints",
    order: 9,
    title: "你人生中最重要的轉折點是什麼？",
    hint: "可能是搬家、換工作、遇到某個人、經歷某件事等",
  },
  {
    id: "turningPoints-2",
    sectionId: "turningPoints",
    order: 10,
    title: "有沒有哪個決定改變了你的人生軌跡？",
    hint: "描述那個決定，以及它如何影響你",
  },
  {
    id: "turningPoints-3",
    sectionId: "turningPoints",
    order: 11,
    title: "你曾經克服過什麼困難或挑戰？",
    hint: "分享你是如何面對和解決的",
  },

  // 價值觀與信念
  {
    id: "values-1",
    sectionId: "values",
    order: 12,
    title: "什麼價值觀對你來說最重要？",
    hint: "例如：誠實、家庭、自由、助人等",
  },
  {
    id: "values-2",
    sectionId: "values",
    order: 13,
    title: "你希望別人如何記住你？",
    hint: "你希望留下什麼樣的印象或影響？",
  },
  {
    id: "values-3",
    sectionId: "values",
    order: 14,
    title: "有什麼人生哲學或座右銘指引著你？",
    hint: "可以是一句話、一個信念，或從經驗中學到的道理",
  },

  // 給家人的話
  {
    id: "messageToFamily-1",
    sectionId: "messageToFamily",
    order: 15,
    title: "你想對家人說什麼？",
    hint: "可以是感謝、愛意、想分享的故事，或任何想說的話",
    optional: true,
  },
  {
    id: "messageToFamily-2",
    sectionId: "messageToFamily",
    order: 16,
    title: "有什麼話想留給未來的家人？",
    hint: "給後代或未來家人的訊息",
    optional: true,
  },
];

// 取得所有問題（按 order 排序）
export const getAllQuestions = (): Question[] => {
  return [...questions].sort((a, b) => a.order - b.order);
};

// 取得特定章節的問題
export const getQuestionsBySection = (sectionId: SectionId): Question[] => {
  return questions
    .filter((q) => q.sectionId === sectionId)
    .sort((a, b) => a.order - b.order);
};

// 取得章節資訊
export const getSectionById = (sectionId: SectionId): Section | undefined => {
  return sections.find((s) => s.id === sectionId);
};

