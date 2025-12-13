import { LifeEntry } from '../types';

interface TimelineProps {
  entries: LifeEntry[];
  onEntryClick?: (entry: LifeEntry) => void;
}

export default function Timeline({ entries, onEntryClick }: TimelineProps) {
  // 按時間排序（年紀或時期，如果都沒有則按輸入時間）
  const sortedEntries = [...entries]
    .filter((entry) => entry.content && entry.content.trim().length > 0)
    .sort((a, b) => {
      // 優先按年紀排序
      if (a.age !== undefined && b.age !== undefined) {
        return a.age - b.age;
      }
      if (a.age !== undefined) return -1;
      if (b.age !== undefined) return 1;

      // 其次按輸入時間排序
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  // 獲取時間標籤
  const getTimeLabel = (entry: LifeEntry, index: number): string => {
    if (entry.age !== undefined) {
      return `${entry.age} 歲`;
    }
    if (entry.period) {
      return entry.period;
    }
    return `記錄 ${index + 1}`;
  };


  // 顏色配置
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
  ];

  if (sortedEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">還沒有任何記錄，開始記錄你的生活片段吧！</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">人生時間軸</h2>

      <div className="relative">
        {/* 時間軸主線 */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

        {/* 時間軸項目 */}
        <div className="space-y-8">
          {sortedEntries.map((entry, index) => {
            const timeLabel = getTimeLabel(entry, index);
            const colorClass = colors[index % colors.length];
            const isEven = index % 2 === 0;

            return (
              <div
                key={entry.id}
                className={`relative flex items-start ${
                  isEven ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* 時間標籤 */}
                <div
                  className={`w-32 flex-shrink-0 text-right ${
                    isEven ? 'pr-6' : 'pl-6 text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${colorClass}`}
                  >
                    {timeLabel}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(entry.createdAt).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* 時間軸節點 */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border-4 border-white shadow-md ${colorClass}`}
                  ></div>
                </div>

                {/* 內容卡片 */}
                <div
                  className={`flex-1 ${
                    isEven ? 'pl-6' : 'pr-6'
                  } ${isEven ? 'text-left' : 'text-right'}`}
                >
                  <div
                    className={`bg-gray-50 rounded-lg p-4 border-l-4 ${colorClass.replace('bg-', 'border-')} hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => onEntryClick?.(entry)}
                  >
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>共 {sortedEntries.length} 個記錄</span>
          <span>
            時間跨度：
            {sortedEntries.length > 0 && (
              <>
                {getTimeLabel(sortedEntries[0], 0)} -{' '}
                {getTimeLabel(sortedEntries[sortedEntries.length - 1], sortedEntries.length - 1)}
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

