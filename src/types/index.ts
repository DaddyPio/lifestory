/**
 * 生活片段
 */
export interface LifeEntry {
  id: string;
  content: string; // 內容
  age?: number; // 年紀（例如：20）
  period?: string; // 時期（例如：大學時期、高中時期）
  timestamp: Date; // 輸入時間
  createdAt: string; // ISO 字串，用於保存
  summary?: string; // AI 生成的摘要（可選，用於快速顯示）
}

/**
 * 自傳生成狀態
 */
export interface BiographyState {
  content: string; // 生成的自傳內容
  lastUpdated: Date; // 最後更新時間
  entryIds: string[]; // 用於生成自傳的內容 ID 列表
  timelineItems?: TimelineItem[]; // 從自傳中提取的時間軸記事
}

/**
 * 時間軸記事
 */
export interface TimelineItem {
  timeLabel: string; // 時間標籤（例如：26歲、1999年、大學時期）
  year?: number; // 年份（如果可提取）
  summary: string; // 摘要（不超過10個中文字）
  content: string; // 完整內容片段
}

