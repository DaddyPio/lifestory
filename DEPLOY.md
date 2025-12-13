# 部署指南

本應用程式可以部署到多個平台。以下是幾種常見的部署方式：

## 方式一：Vercel（推薦）

### 步驟：

1. **安裝 Vercel CLI**（如果還沒安裝）：
   ```bash
   npm install -g vercel
   ```

2. **在專案目錄中登入 Vercel**：
   ```bash
   cd lifestory
   vercel login
   ```

3. **部署**：
   ```bash
   vercel
   ```

4. **生產環境部署**：
   ```bash
   vercel --prod
   ```

### 或使用 GitHub 自動部署：

1. 將程式碼推送到 GitHub
2. 前往 [Vercel](https://vercel.com)
3. 點擊 "New Project"
4. 選擇你的 GitHub repository
5. Vercel 會自動檢測 Vite 專案並部署

---

## 方式二：Netlify

### 步驟：

1. **安裝 Netlify CLI**（如果還沒安裝）：
   ```bash
   npm install -g netlify-cli
   ```

2. **構建專案**：
   ```bash
   cd lifestory
   npm run build
   ```

3. **部署**：
   ```bash
   netlify deploy --prod --dir=dist
   ```

### 或使用拖放部署：

1. 構建專案：`npm run build`
2. 前往 [Netlify Drop](https://app.netlify.com/drop)
3. 將 `dist` 資料夾拖放到頁面上

---

## 方式三：GitHub Pages

### 步驟：

1. **安裝 gh-pages**：
   ```bash
   cd lifestory
   npm install --save-dev gh-pages
   ```

2. **修改 package.json**，添加部署腳本：
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **修改 vite.config.ts**，添加 base 路徑：
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/', // 改為你的 repository 名稱
     plugins: [react()],
   })
   ```

4. **部署**：
   ```bash
   npm run deploy
   ```

---

## 方式四：其他靜態託管服務

### 構建步驟：

1. **構建生產版本**：
   ```bash
   cd lifestory
   npm run build
   ```

2. **構建完成後**，`dist` 資料夾包含所有靜態檔案

3. **上傳 `dist` 資料夾的內容**到任何靜態託管服務，例如：
   - Cloudflare Pages
   - AWS S3 + CloudFront
   - Firebase Hosting
   - 任何支援靜態網站的服務

---

## 注意事項

⚠️ **重要**：此應用程式在前端直接使用 OpenAI API Key，僅適合個人使用。

- API Key 會儲存在使用者的瀏覽器 LocalStorage 中
- 不建議在公開環境中部署，除非你了解安全風險
- 如需公開部署，建議使用後端 API 來處理 OpenAI 請求

---

## 環境變數（可選）

如果需要使用環境變數，可以在部署平台設定：

- `VITE_APP_TITLE`: 應用程式標題（可選）

---

## 測試部署

部署後，請測試以下功能：

1. ✅ 輸入 API Key
2. ✅ 記錄生活片段
3. ✅ 查看所有記錄
4. ✅ 生成自傳
5. ✅ 語音輸入功能（需要 HTTPS）

---

## 故障排除

### 問題：頁面刷新後出現 404

**解決方案**：確保託管服務已設定 SPA（單頁應用）路由重定向。已包含 `vercel.json` 和 `netlify.toml` 配置文件。

### 問題：語音功能無法使用

**解決方案**：語音功能需要 HTTPS 連線。確保部署的網站使用 HTTPS。

### 問題：API Key 無法保存

**解決方案**：檢查瀏覽器是否允許 LocalStorage。某些瀏覽器的隱私模式可能會限制 LocalStorage。

