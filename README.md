# 人生小傳 MVP

一個簡單的個人傳記生成工具，透過記錄生活片段，使用 OpenAI API 自動生成個人自傳。

## 功能特色

- 📝 自由記錄生活片段（打字或語音輸入）
- 🏷️ 可標註年紀或時期（例如：20歲、大學時期）
- 📋 查看、編輯、刪除所有記錄
- ✨ 使用 OpenAI API 自動整合生成個人自傳
- 🔄 自動更新：新增內容時，自傳會自動更新
- 💾 所有數據保存在瀏覽器 LocalStorage
- 📱 Mobile-first 設計

## 技術棧

- React + TypeScript
- Vite
- Tailwind CSS
- OpenAI API

## 本地開發

### 安裝依賴

```bash
npm install
```

### 設定環境變數

1. 複製環境變數範例文件：
   ```bash
   cp .env.local.example .env.local
   ```

2. 編輯 `.env.local`，填入你的 OpenAI API Key：
   ```
   VITE_OPENAI_API_KEY=sk-your-api-key-here
   ```

### 啟動開發伺服器

```bash
npm run dev
```

在瀏覽器中開啟 `http://localhost:5173`

### 構建生產版本

```bash
npm run build
```

構建結果在 `dist` 資料夾中。

**注意**：構建時會將環境變數注入到代碼中，確保已設定 `VITE_OPENAI_API_KEY`。

## 部署

### 部署到 Vercel（推薦）

1. 將程式碼推送到 GitHub
2. 前往 [vercel.com](https://vercel.com) 並登入
3. 點擊 "Add New Project"
4. 導入你的 GitHub repository
5. Vercel 會自動檢測 Vite 專案並部署

詳細部署指南請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 使用說明

1. 點擊「記錄」開始記錄生活片段
2. 可以標註年紀或時期（選填）
3. 使用打字或語音輸入內容
4. 點擊「所有記錄」查看、編輯或刪除記錄
5. 點擊「時間軸」查看視覺化的時間軸
6. 點擊「我的自傳」查看 AI 自動生成的自傳
7. 新增或修改內容時，自傳會自動更新

## 注意事項

⚠️ **此應用程式在前端直接使用 OpenAI API Key。**

- API Key 在構建時通過環境變數設定
- 部署時需要在 Vercel 等平台設定環境變數
- API Key 會注入到前端代碼中，任何人都可以查看
- 建議使用 API Key 的額度限制功能並監控使用量

## 專案結構

```
lifestory/
├── src/
│   ├── components/      # React 元件
│   │   ├── Welcome.tsx
│   │   ├── EntryInput.tsx
│   │   ├── EntryList.tsx
│   │   └── Biography.tsx
│   ├── hooks/           # 自定義 Hooks
│   │   ├── useSpeechRecognition.ts
│   │   └── useSpeechSynthesis.ts
│   ├── types/           # TypeScript 類型定義
│   │   └── index.ts
│   ├── App.tsx          # 主應用程式
│   ├── main.tsx         # 入口檔案
│   └── index.css        # 樣式
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json          # Vercel 部署配置
└── DEPLOYMENT.md        # 部署指南
```
