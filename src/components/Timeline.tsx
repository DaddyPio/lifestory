import { useState, useEffect } from 'react';
import { LifeEntry, BiographyState, TimelineItem } from '../types';
import { generateSummary } from '../services/summaryService';

interface TimelineProps {
  entries: LifeEntry[];
  apiKey: string;
  biography?: BiographyState | null;
  onEntryClick?: (entry: LifeEntry | TimelineItem) => void;
}

export default function Timeline({ entries, apiKey, biography, onEntryClick }: TimelineProps) {
  const [summaries, setSummaries] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // 優先使用從自傳中提取的時間軸記事
  const useBiographyTimeline = biography?.timelineItems && biography.timelineItems.length > 0;
  const timelineItems: TimelineItem[] = useBiographyTimeline ? biography!.timelineItems! : [];

  // 按時間排序（優先使用年紀或時期）- 僅在沒有使用自傳時間軸時
  const sortedEntries = useBiographyTimeline
    ? []
    : [...entries]
    .filter((entry) => entry.content && entry.content.trim().length > 0)
    .sort((a, b) => {
      // 優先按年紀排序
      if (a.age !== undefined && b.age !== undefined) {
        return a.age - b.age;
      }
      if (a.age !== undefined) return -1;
      if (b.age !== undefined) return 1;

      // 如果都沒有年紀，按時期排序
      if (a.period && b.period) {
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
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.period.localeCompare(b.period, 'zh-TW');
      }
      if (a.period) return -1;
      if (b.period) return 1;

      // 最後按輸入時間排序
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  // 獲取時間標籤
  const getTimeLabel = (item: LifeEntry | TimelineItem): string => {
    if ('timeLabel' in item) {
      // TimelineItem
      return item.timeLabel;
    }
    // LifeEntry
    if (item.age !== undefined) {
      return `${item.age} 歲`;
    }
    if (item.period) {
      return item.period;
    }
    return new Date(item.createdAt).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
    });
  };

  // 獲取年份（用於時間軸顯示）
  const getYear = (item: LifeEntry | TimelineItem): number | null => {
    if ('year' in item && item.year !== undefined) {
      // TimelineItem
      return item.year;
    }
    if ('age' in item && item.age !== undefined) {
      // LifeEntry - 嘗試從年紀推算年份
      const currentYear = new Date().getFullYear();
      return currentYear - item.age;
    }
    if ('createdAt' in item) {
      // LifeEntry - 從創建時間獲取年份
      return new Date(item.createdAt).getFullYear();
    }
    return null;
  };

  // 生成摘要（僅在沒有使用自傳時間軸時）
  useEffect(() => {
    if (useBiographyTimeline || !apiKey || sortedEntries.length === 0) return;

    const generateSummariesForEntries = async () => {
      setIsGenerating(true);
      const newSummaries: { [key: string]: string } = {};

      // 只為沒有摘要的條目生成摘要（限制為10個中文字）
      const entriesToSummarize = sortedEntries.filter(
        (entry) => !entry.summary && entry.content.trim().length > 10
      );

      for (const entry of entriesToSummarize) {
        try {
          const summary = await generateSummary({
            apiKey,
            content: entry.content,
            maxLength: 10, // 限制為10個中文字
          });
          newSummaries[entry.id] = summary;
        } catch (error) {
          console.error(`為條目 ${entry.id} 生成摘要失敗:`, error);
          // 使用簡單截取作為後備
          newSummaries[entry.id] = entry.content.substring(0, 10) + '...';
        }
      }

      setSummaries((prev) => ({ ...prev, ...newSummaries }));
      setIsGenerating(false);
    };

    generateSummariesForEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, sortedEntries.length, useBiographyTimeline]);

  // 顏色配置（類似圖片中的彩色區塊）
  const colors = [
    { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-500' },
    { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-500' },
    { bg: 'bg-green-600', text: 'text-white', border: 'border-green-600' },
    { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500' },
    { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-500' },
    { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-500' },
    { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-500' },
    { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-500' },
  ];

  // 獲取摘要
  const getSummary = (item: LifeEntry | TimelineItem): string => {
    if ('summary' in item && item.summary) {
      // TimelineItem - 直接使用摘要
      return item.summary;
    }
    // LifeEntry
    if ('summary' in item && item.summary) return item.summary;
    if ('id' in item && summaries[item.id]) return summaries[item.id];
    // 如果內容很短，直接返回
    if (item.content.length <= 10) return item.content;
    // 否則顯示載入中或簡單截取（限制為10個中文字）
    return item.content.substring(0, 10) + '...';
  };

  // 決定要顯示的項目
  const displayItems = useBiographyTimeline ? timelineItems : sortedEntries;

  if (displayItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">
          {useBiographyTimeline
            ? '自傳中沒有提取到時間軸記事，請先生成自傳'
            : '還沒有任何記錄，開始記錄你的生活片段吧！'}
        </p>
      </div>
    );
  }

  // 獲取所有年份範圍（用於未來可能的擴展）
  // const years = sortedEntries
  //   .map(getYear)
  //   .filter((y): y is number => y !== null)
  //   .sort((a, b) => a - b);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">人生時間軸</h2>

      {isGenerating && (
        <div className="mb-4 text-sm text-gray-500 text-center">
          正在生成摘要...
        </div>
      )}

      {/* 水平時間軸 */}
      <div className="relative overflow-x-auto pb-8">
        <div className="relative" style={{ minHeight: '400px', minWidth: `${Math.max(800, displayItems.length * 200)}px` }}>
          {/* 主時間軸線（虛線） */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-gray-300 transform -translate-y-1/2"></div>

          {/* 時間軸項目 */}
          <div className="relative flex items-center justify-start gap-4 px-4" style={{ paddingTop: '200px', paddingBottom: '200px' }}>
            {displayItems.map((item, index) => {
              const timeLabel = getTimeLabel(item);
              const year = getYear(item);
              const color = colors[index % colors.length];
              const summary = getSummary(item);

              return (
                <div
                  key={useBiographyTimeline ? `timeline-${index}` : ('id' in item ? item.id : `item-${index}`)}
                  className="relative flex flex-col items-center"
                  style={{ minWidth: '180px' }}
                >
                  {/* 上方圖標區域 */}
                  <div className="relative mb-4">
                    {/* 連接線（虛線） */}
                    <div className="absolute top-0 left-1/2 w-0.5 h-20 border-l border-dashed border-gray-300 transform -translate-x-1/2"></div>
                    
                    {/* 圖標圓圈 */}
                    <div
                      className={`relative w-14 h-14 rounded-full ${color.bg} ${color.text} flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform z-10`}
                      onClick={() => onEntryClick?.(item)}
                    >
                      {/* 簡單的圖標（書本圖標） */}
                      <svg
                        className="w-7 h-7"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                  </div>

                  {/* 中間年份/時間標籤區塊（Chevron 形狀） */}
                  <div className="relative mb-4 z-20">
                    <div
                      className={`relative ${color.bg} ${color.text} px-5 py-2.5 font-bold text-base shadow-md`}
                      style={{
                        clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)',
                      }}
                    >
                      <div className="whitespace-nowrap">
                        {year ? `${year}` : timeLabel}
                      </div>
                    </div>
                  </div>

                  {/* 下方文字描述區域 */}
                  <div className="relative mt-4">
                    {/* 連接線（虛線） */}
                    <div className="absolute bottom-full left-1/2 w-0.5 h-20 border-l border-dashed border-gray-300 transform -translate-x-1/2"></div>
                    
                    {/* 文字框 */}
                    <div
                      className={`bg-white border-2 ${color.border} rounded-lg p-4 shadow-md w-48 cursor-pointer hover:shadow-lg transition-shadow`}
                      onClick={() => onEntryClick?.(item)}
                    >
                      <p className="text-sm text-gray-700 leading-relaxed text-center">
                        {summary}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>共 {displayItems.length} 個記錄</span>
          {displayItems.length > 0 && (
            <span>
              時間跨度：{getTimeLabel(displayItems[0])} - {getTimeLabel(displayItems[displayItems.length - 1])}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
