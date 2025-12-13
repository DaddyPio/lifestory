# LifeStory MVP 部署指南

## 方法一：部署到 Vercel（推薦，最簡單）

Vercel 提供免費的 HTTPS 和全球 CDN，非常適合部署 Vite + React 應用。

### 步驟 1：準備代碼

1. 確保代碼已提交到 Git（GitHub、GitLab 等）
   ```bash
   cd lifestory
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### 步驟 2：部署到 Vercel

1. 前往 [vercel.com](https://vercel.com) 並註冊/登入
2. 點擊 "Add New Project"
3. 導入你的 Git 倉庫
4. 配置項目：
   - **Framework Preset**: Vite（自動檢測）
   - **Root Directory**: `lifestory`（如果倉庫根目錄不是 lifestory）
   - **Build Command**: `npm run build`（自動檢測）
   - **Output Directory**: `dist`（自動檢測）
5. 點擊 "Deploy"

### 步驟 3：部署完成

部署完成後，Vercel 會給你一個 URL（例如：`https://lifestory-mvp.vercel.app`）

### 步驟 4：在手機上使用

- 在手機瀏覽器中訪問你的 Vercel URL
- 可以添加到主屏幕（iOS Safari：分享 → 加入主畫面；Android Chrome：選單 → 加入主畫面）

---

## 方法二：使用 ngrok（快速測試，無需部署）

適合快速測試，讓手機訪問本地開發服務器。

### 步驟 1：安裝 ngrok

1. 前往 [ngrok.com](https://ngrok.com) 註冊並下載
2. 或使用 npm 安裝：
   ```bash
   npm install -g ngrok
   ```

### 步驟 2：啟動開發服務器

```bash
cd lifestory
npm run dev
```

### 步驟 3：啟動 ngrok

在新的終端窗口中：
```bash
ngrok http 5173
```

### 步驟 4：在手機上使用

1. ngrok 會顯示一個 URL（例如：`https://abc123.ngrok.io`）
2. 在手機瀏覽器中訪問這個 URL
3. **注意**：免費版 ngrok URL 每次重啟都會改變

---

## 方法三：部署到其他平台

### Netlify

1. 前往 [netlify.com](https://netlify.com)
2. 連接 Git 倉庫
3. 構建設置：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 部署

### GitHub Pages

1. 安裝 gh-pages：
   ```bash
   npm install --save-dev gh-pages
   ```

2. 修改 `package.json`，添加部署腳本：
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. 修改 `vite.config.ts`，添加 base 路徑：
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/', // 改為你的 repository 名稱
     plugins: [react()],
   })
   ```

4. 部署：
   ```bash
   npm run deploy
   ```

---

## 重要配置

### 1. HTTPS 要求

- 語音錄製功能需要 HTTPS
- Vercel、Netlify 等平台自動提供 HTTPS
- 如果使用自定義域名，確保配置了 SSL 證書

### 2. API Key 安全

⚠️ **重要**：此應用程式在前端直接使用 OpenAI API Key，僅適合個人使用。

- API Key 會儲存在使用者的瀏覽器 LocalStorage 中
- 不建議在公開環境中部署，除非你了解安全風險
- 如需公開部署，建議使用後端 API 來處理 OpenAI 請求

---

## 分享給朋友

### 方法 1：直接分享 URL

1. 部署完成後，將你的應用 URL 分享給朋友
2. 他們可以直接在瀏覽器中訪問
3. 每個使用者需要輸入自己的 OpenAI API Key

### 方法 2：添加到主屏幕

**iOS (Safari):**
1. 打開應用
2. 點擊分享按鈕
3. 選擇 "加入主畫面"

**Android (Chrome):**
1. 打開應用
2. 點擊選單（三個點）
3. 選擇 "加入主畫面" 或 "安裝應用"

---

## 成本估算

### 免費方案

- **Vercel**: 免費（適合個人項目）
- **OpenAI API**: 按使用量付費（約 $0.01-0.10 每 1000 tokens）

### 預估月成本

- 小規模使用（每天生成 1-2 次自傳）：約 $1-5/月
- 中等使用（每天生成 5-10 次自傳）：約 $10-30/月

---

## 故障排除

### 部署後無法訪問

1. 檢查 Vercel 部署日誌
2. 確認構建成功（`npm run build` 沒有錯誤）
3. 檢查 `vercel.json` 配置是否正確

### 手機上無法錄音

1. 確認使用 HTTPS（不是 HTTP）
2. 檢查瀏覽器權限（允許麥克風訪問）
3. 嘗試不同的瀏覽器

### API 錯誤

1. 確認使用者已輸入有效的 OpenAI API Key
2. 檢查 API key 是否有足夠的餘額
3. 查看瀏覽器控制台的錯誤訊息

### 頁面刷新後出現 404

**解決方案**：`vercel.json` 已包含 SPA 路由重定向配置，應該可以正常運作。如果仍有問題，檢查 Vercel 項目設置中的 "Rewrites" 配置。

---

## 推薦部署流程

1. **開發階段**: 使用 `npm run dev` 在本地開發
2. **測試階段**: 使用 ngrok 在手機上測試
3. **生產部署**: 部署到 Vercel 並分享給朋友

---

## 快速部署命令

如果已安裝 Vercel CLI：

```bash
cd lifestory
vercel
```

按照提示完成部署即可。

