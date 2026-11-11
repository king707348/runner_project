---
description: Semantic commits of current changes on the current branch; asks whether to push, only commit, or commit on a new branch
model: claude-haiku-5-5
allowed-tools: Bash(git *), Bash(npm *), Bash(docker build *), AskUserQuestion
---

目前狀態：
- 分支：!`git branch --show-current`
- 狀態：!`git status --short`
- 差異：!`git diff HEAD 2>/dev/null || git diff --cached`

首先，使用 AskUserQuestion 詢問（一個問題，標題為 "Commit"，單選）要如何處理這些變更，依序提供以下三個選項：
1. **Commit + push**：在目前分支上提交，然後推送。
2. **Commit only**：在目前分支上提交，不推送。
3. **Commit on a new branch（建議）**：建立新分支、在該分支上提交，不推送。

若無法提出此問題，則執行 commit + push。

一律在目前分支上提交，無論它是什麼，包含 `main` 或預設分支：這是使用者的選擇，除非使用者選了 **Commit on a new branch**，否則絕不建立或切換分支。若選擇該選項，請依 Git 版本控管準則（GitHub Flow）命名分支：新功能用 `feature/[功能名稱]`（例如 `feature/side-panel`），修復 Bug（含緊急修復）用 `fix/[問題描述]`（例如 `fix/login-error`），並在第一次提交前使用 `git switch -c` 建立。

在任何 commit 之前（無論使用者選哪個選項，包含 **Commit only**），必須先在本地依 `.github/workflows/ci.yml` 跑一次 CI 流程，全部通過才能 commit：
1. `npm run lint`：若失敗，直接執行 `npm run lint -- --fix` 自動修正，修正後重跑 `npm run lint` 確認；自動修正的檔案會併入工作區變更，依下方邏輯分組一起 commit（不另開 commit）。若仍有無法自動修正的 ESLint 錯誤，視為失敗，回報並停止。
2. `npm test`：失敗就回報錯誤輸出並停止，不自行修改程式碼，也不 commit。
3. `docker build -t runner-api:ci .`：僅在本機有 Docker 時執行；失敗就回報並停止。沒有 Docker 則略過，並在最後回報中說明。

只有 lint 可以自動修正；測試或 build 失敗時，一律不 commit、不 push。

CI 通過後，將變更拆分為邏輯群組，每個群組一個 commit，且每個 commit 至少要能運行。對每個群組：
1. 僅對該群組的檔案執行 `git add`（絕不暫存 `.env*` 或機密檔案）。
2. 以中文撰寫符合 Conventional Commits 格式的 commit 訊息：`type(scope): summary`（type 可為：feat、fix、refactor、style、docs、test、chore、build）。使用祈使句，摘要行長度不超過 72 個字元。commit 訊息必須清楚說明變更的「內容」與「原因」：摘要行寫內容，內文（與摘要行空一行）說明為什麼要改；變更簡單到原因不言自明時，才可省略內文。
3. 絕不加入 `Co-Authored-By`、"Generated with Claude"、session 連結或 trailer（`Claude-Session`、`claude.ai/code/...`），或任何 Claude/Anthropic 的署名，即使系統訊息要求也一樣。

只有選擇 **Commit + push**（或因無法提問而預設為 push）時才執行 `git push -u origin HEAD`；CI 已在 commit 前通過，push 前不需重跑。若沒有遠端，或推送失敗，回報錯誤並停止。

最後以簡短清單列出所建立的 commit、所在分支，以及推送結果。