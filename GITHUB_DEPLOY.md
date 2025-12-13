# GitHub + Vercel 部署步驟

## 步驟 1：在 GitHub 建立 Repository

1. 前往 [GitHub](https://github.com) 並登入
2. 點擊右上角的 "+" → "New repository"
3. 填寫資訊：
   - **Repository name**: `lifestory-mvp`（或你喜歡的名稱）
   - **Description**: 人生小傳 MVP - 個人傳記生成工具
   - **Visibility**: Public 或 Private（都可以）
   - **不要**勾選 "Initialize this repository with a README"（因為我們已經有代碼了）
4. 點擊 "Create repository"

## 步驟 2：將代碼推送到 GitHub

在終端中執行以下命令（將 `<your-username>` 和 `<repository-name>` 替換為你的實際資訊）：

```bash
cd C:\11_Cursor\lifestory
git remote add origin https://github.com/<your-username>/<repository-name>.git
git branch -M main
git push -u origin main
```

例如，如果你的 GitHub 用戶名是 `john`，repository 名稱是 `lifestory-mvp`，則執行：

```bash
git remote add origin https://github.com/john/lifestory-mvp.git
git branch -M main
git push -u origin main
```

## 步驟 3：在 Vercel 部署

1. 前往 [vercel.com](https://vercel.com) 並登入（可以使用 GitHub 帳號登入）

2. 點擊 "Add New Project" 或 "Import Project"

3. 選擇 "Import Git Repository"

4. 選擇你剛才建立的 GitHub repository（`lifestory-mvp`）

5. 配置項目：
   - **Project Name**: `lifestory-mvp`（或你喜歡的名稱）
   - **Framework Preset**: Vite（應該會自動檢測）
   - **Root Directory**: `./`（保持預設）
   - **Build Command**: `npm run build`（應該會自動填入）
   - **Output Directory**: `dist`（應該會自動填入）
   - **Install Command**: `npm install`（應該會自動填入）

6. 點擊 "Deploy"

7. 等待部署完成（通常需要 1-2 分鐘）

## 步驟 4：完成！

部署完成後，Vercel 會給你一個 URL，例如：
- `https://lifestory-mvp.vercel.app`
- 或 `https://lifestory-mvp-<your-username>.vercel.app`

你可以：
- 直接訪問這個 URL 使用應用
- 分享給朋友
- 在手機上訪問

## 後續更新

之後如果你修改了代碼，只需要：

```bash
git add .
git commit -m "更新說明"
git push
```

Vercel 會自動檢測到更新並重新部署！

## 自定義域名（可選）

如果你有自己的域名，可以在 Vercel 項目設置中添加自定義域名。

## 故障排除

### 問題：推送時要求輸入 GitHub 帳號密碼

**解決方案**：使用 Personal Access Token
1. 前往 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 生成新的 token，勾選 `repo` 權限
3. 推送時使用 token 作為密碼

### 問題：Vercel 部署失敗

**解決方案**：
1. 檢查 Vercel 部署日誌中的錯誤訊息
2. 確認 `package.json` 中的構建腳本正確
3. 確認所有依賴都已正確安裝

### 問題：部署後頁面空白

**解決方案**：
1. 檢查瀏覽器控制台的錯誤
2. 確認 `vercel.json` 中的 rewrites 配置正確
3. 確認構建成功（`dist` 資料夾中有文件）

