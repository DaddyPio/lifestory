interface WelcomeProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onStart: () => void;
}

export default function Welcome({ apiKey, onApiKeyChange, onStart }: WelcomeProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onStart();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            人生小傳 MVP
          </h1>
          <p className="text-gray-600 mb-8 text-center leading-relaxed">
            透過一系列簡單的訪談問題，幫你整理出一篇屬於自己的個人傳記。
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="api-key"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                OpenAI API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoComplete="off"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500">
                此 Key 只會保存在你的瀏覽器 LocalStorage，不會傳到其他地方。
                <br />
                <span className="text-orange-600 font-medium">
                  但前端使用 Key 僅適合個人測試。
                </span>
                <br />
                <span className="text-gray-400">
                  ⚠️ 只需輸入一次，之後會自動記住。
                </span>
              </p>
            </div>

            <button
              type="submit"
              disabled={!apiKey.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              開始訪談
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

