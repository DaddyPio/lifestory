import { useState, useEffect } from 'react';
import EntryInput from './components/EntryInput';
import EntryList from './components/EntryList';
import Biography from './components/Biography';
import Timeline from './components/Timeline';
import { LifeEntry, BiographyState } from './types';

export type Step = 'input' | 'list' | 'timeline' | 'biography';

function App() {
  // 從環境變數讀取 API Key
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  
  const [step, setStep] = useState<Step>('input');
  const [entries, setEntries] = useState<LifeEntry[]>([]);
  const [biography, setBiography] = useState<BiographyState | null>(null);

  // 檢查 API Key 是否設定
  useEffect(() => {
    if (!apiKey) {
      console.error('VITE_OPENAI_API_KEY 未設定，請在環境變數中設定');
    }
  }, [apiKey]);

  // 從 localStorage 載入數據
  useEffect(() => {
    const savedEntries = localStorage.getItem('lifeStory-entries');
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('載入記錄失敗:', error);
      }
    }

    const savedBiography = localStorage.getItem('lifeStory-biography');
    if (savedBiography) {
      try {
        const bio = JSON.parse(savedBiography);
        setBiography({
          ...bio,
          lastUpdated: new Date(bio.lastUpdated),
        });
      } catch (error) {
        console.error('載入自傳失敗:', error);
      }
    }
  }, []);

  // 保存 entries 到 localStorage
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('lifeStory-entries', JSON.stringify(entries));
    }
  }, [entries]);

  // 保存 biography 到 localStorage
  useEffect(() => {
    if (biography) {
      localStorage.setItem('lifeStory-biography', JSON.stringify(biography));
    }
  }, [biography]);


  // 保存新的生活片段
  const handleSaveEntry = async (entryData: Omit<LifeEntry, 'id' | 'timestamp' | 'createdAt'>) => {
    const newEntry: LifeEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...entryData,
      timestamp: new Date(),
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [...prev, newEntry]);
  };

  // 刪除生活片段
  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    // 如果自傳包含這個內容，需要重新生成
    if (biography && biography.entryIds.includes(id)) {
      setBiography(null);
    }
  };

  // 編輯生活片段
  const handleEditEntry = (id: string, updates: Partial<LifeEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    // 如果自傳包含這個內容，需要重新生成
    if (biography && biography.entryIds.includes(id)) {
      setBiography(null);
    }
  };

  // 更新自傳
  const handleBiographyUpdate = (newBiography: BiographyState) => {
    setBiography(newBiography);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="My story" className="w-8 h-8" />
            <h1 className="text-lg font-semibold text-gray-900">My story</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep('input')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === 'input'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              記錄
            </button>
            <button
              onClick={() => setStep('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              所有記錄 ({entries.length})
            </button>
            <button
              onClick={() => setStep('timeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === 'timeline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              時間軸
            </button>
            <button
              onClick={() => setStep('biography')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === 'biography'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              我的自傳
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {!apiKey && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">API Key 未設定</h2>
            <p className="text-red-600 mb-4">
              請在環境變數中設定 <code className="bg-red-100 px-2 py-1 rounded">VITE_OPENAI_API_KEY</code>
            </p>
            <p className="text-sm text-red-500">
              部署時請在 Vercel 項目設置中添加環境變數
            </p>
          </div>
        )}

        {apiKey && step === 'input' && (
          <EntryInput onSave={handleSaveEntry} />
        )}

        {apiKey && step === 'list' && (
          <EntryList
            entries={entries}
            onDelete={handleDeleteEntry}
            onEdit={handleEditEntry}
          />
        )}

        {apiKey && step === 'timeline' && (
          <Timeline
            entries={entries}
            apiKey={apiKey}
            onEntryClick={() => {
              // 點擊時間軸項目時，可以跳轉到編輯或顯示詳情
              setStep('list');
              // 可以添加滾動到特定項目的功能
            }}
          />
        )}

        {apiKey && step === 'biography' && (
          <Biography
            entries={entries}
            apiKey={apiKey}
            biography={biography}
            onBiographyUpdate={handleBiographyUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default App;
