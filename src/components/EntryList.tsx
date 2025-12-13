import { useState } from 'react';
import { LifeEntry } from '../types';

interface EntryListProps {
  entries: LifeEntry[];
  onDelete: (id: string) => void;
  onEdit: (id: string, entry: Partial<LifeEntry>) => void;
}

export default function EntryList({ entries, onDelete, onEdit }: EntryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editAge, setEditAge] = useState<string>('');
  const [editPeriod, setEditPeriod] = useState('');

  // 按時間排序（最新的在前）
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleStartEdit = (entry: LifeEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
    setEditAge(entry.age?.toString() || '');
    setEditPeriod(entry.period || '');
  };

  const handleSaveEdit = (id: string) => {
    onEdit(id, {
      content: editContent.trim(),
      age: editAge ? parseInt(editAge) : undefined,
      period: editPeriod.trim() || undefined,
    });
    setEditingId(null);
    setEditContent('');
    setEditAge('');
    setEditPeriod('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditAge('');
    setEditPeriod('');
  };

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
            {editingId === entry.id ? (
              // 編輯模式
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    placeholder="年紀"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={editPeriod}
                    onChange={(e) => setEditPeriod(e.target.value)}
                    placeholder="時期"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(entry.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // 顯示模式
              <>
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
                    onClick={() => handleStartEdit(entry)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    編輯
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
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

