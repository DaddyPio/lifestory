import { useState } from 'react';
import { LifeEntry } from '../types';

interface ReviewProps {
  entries: LifeEntry[];
  onEdit: (id: string, entry: Partial<LifeEntry>) => void;
  onDelete: (id: string) => void;
}

export default function Review({
  entries,
  onDelete,
}: ReviewProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleEntry = (id: string) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">還沒有任何記錄，開始記錄你的生活片段吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          所有記錄 ({entries.length})
        </h2>
      </div>

      <div className="space-y-3">
        {sortedEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {entry.age && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {entry.age} 歲
                    </span>
                  )}
                  {entry.period && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      {entry.period}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(entry.createdAt).toLocaleString('zh-TW')}
                  </span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{entry.content}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => toggleEntry(entry.id)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {expandedEntries.has(entry.id) ? '收起' : '編輯'}
              </button>
              <button
                onClick={() => {
                  if (confirm('確定要刪除這條記錄嗎？')) {
                    onDelete(entry.id);
                  }
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
