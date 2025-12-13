# 🚀 快速部署步驟

## 現在請按照以下步驟操作：

### 1️⃣ 在 GitHub 建立 Repository

1. 前往 https://github.com 並登入
2. 點擊右上角 "+" → "New repository"
3. Repository 名稱：`lifestory-mvp`（或你喜歡的名稱）
4. 選擇 Public 或 Private
5. **不要**勾選任何初始化選項
6. 點擊 "Create repository"

### 2️⃣ 複製 Repository URL

建立完成後，GitHub 會顯示 repository URL，例如：
- `https://github.com/你的用戶名/lifestory-mvp.git`

### 3️⃣ 執行以下命令推送代碼

**請將 `<你的-GitHub-URL>` 替換為步驟 2 的 URL**

```bash
cd C:\11_Cursor\lifestory
git remote add origin <你的-GitHub-URL>
git branch -M main
git push -u origin main
```

例如：
```bash
git remote add origin https://github.com/john/lifestory-mvp.git
git branch -M main
git push -u origin main
```

### 4️⃣ 在 Vercel 部署

1. 前往 https://vercel.com 並登入（可用 GitHub 帳號登入）
2. 點擊 "Add New Project"
3. 選擇 "Import Git Repository"
4. 選擇你的 `lifestory-mvp` repository
5. 點擊 "Deploy"（設定會自動檢測）
6. 等待 1-2 分鐘完成部署

### 5️⃣ 完成！

部署完成後，你會得到一個 URL，例如：
- `https://lifestory-mvp.vercel.app`

就可以開始使用了！🎉

---

## 💡 提示

- 之後修改代碼，只需要 `git push`，Vercel 會自動重新部署
- 詳細說明請參考 `GITHUB_DEPLOY.md`

