# 人生小傳 MVP

一個簡單的個人傳記生成工具，透過訪談問題收集資訊，並使用 OpenAI API 生成個人小傳。

## 功能特色

- 📝 引導式訪談流程，逐題顯示問題
- 📊 進度條顯示完成進度
- 📋 回答總覽與編輯功能
- ✨ 使用 OpenAI API 自動生成個人小傳
- 💾 回答內容自動保存
- 📱 Mobile-first 設計

## 技術棧

- React + TypeScript
- Vite
- Tailwind CSS
- OpenAI API

## 安裝與執行

1. 安裝依賴：
```bash
npm install
```

2. 啟動開發伺服器：
```bash
npm run dev
```

3. 在瀏覽器中開啟顯示的網址（通常是 http://localhost:5173）

## 使用說明

1. 在歡迎頁面輸入你的 OpenAI API Key
2. 點擊「開始訪談」進入訪談流程
3. 逐一回答問題，可以使用「上一題」/「下一題」導航
4. 完成所有問題後，可以查看「回答總覽」進行編輯
5. 點擊「生成人生小傳」讓 AI 為你撰寫個人傳記
6. 可以複製、重新生成，或返回修改回答

## 注意事項

⚠️ **此應用程式在前端直接使用 OpenAI API Key，僅適合個人測試使用，不適合正式上線環境。**

API Key 會儲存在瀏覽器的 LocalStorage 中，不會傳送到其他伺服器。

## 專案結構

```
lifestory/
├── src/
│   ├── components/      # React 元件
│   │   ├── Welcome.tsx
│   │   ├── Interview.tsx
│   │   ├── Review.tsx
│   │   └── Biography.tsx
│   ├── data/
│   │   └── questions.ts # 訪談問題定義
│   ├── App.tsx          # 主應用程式
│   ├── main.tsx         # 入口檔案
│   └── index.css        # 樣式
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.cjs
```

