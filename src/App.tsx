import { useState, useEffect } from 'react';
import Welcome from './components/Welcome';
import EntryInput from './components/EntryInput';
import EntryList from './components/EntryList';
import Biography from './components/Biography';
import Timeline from './components/Timeline';
import { LifeEntry, BiographyState } from './types';

export type Step = 'welcome' | 'input' | 'list' | 'timeline' | 'biography';

function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [apiKey, setApiKey] = useState<string>('');
  const [entries, setEntries] = useState<LifeEntry[]>([]);
  const [biography, setBiography] = useState<BiographyState | null>(null);

  // 從 localStorage 載入數據
  useEffect(() => {
    const savedKey = localStorage.getItem('lifeStory-openai-key');
    if (savedKey) {
      setApiKey(savedKey);
      setStep('input');
    }

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

  // 儲存 API Key 到 localStorage
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('lifeStory-openai-key', key);
  };

  // 開始使用
  const handleStart = () => {
    setStep('input');
  };

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
          <h1 className="text-lg font-semibold text-gray-900">人生小傳 MVP</h1>
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
            <button
              onClick={() => {
                if (confirm('確定要重新輸入 API Key 嗎？')) {
                  localStorage.removeItem('lifeStory-openai-key');
                  setApiKey('');
                  setStep('welcome');
                }
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              title="重新輸入 API Key"
            >
              ⚙️
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {step === 'welcome' && (
          <Welcome
            apiKey={apiKey}
            onApiKeyChange={handleApiKeyChange}
            onStart={handleStart}
          />
        )}

        {step === 'input' && (
          <EntryInput onSave={handleSaveEntry} />
        )}

        {step === 'list' && (
          <EntryList
            entries={entries}
            onDelete={handleDeleteEntry}
            onEdit={handleEditEntry}
          />
        )}

        {step === 'timeline' && (
          <Timeline
            entries={entries}
            onEntryClick={() => {
              // 點擊時間軸項目時，可以跳轉到編輯或顯示詳情
              setStep('list');
              // 可以添加滾動到特定項目的功能
            }}
          />
        )}

        {step === 'biography' && (
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
