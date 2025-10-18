# Windsurf用プロンプト（ミニマリストしぶ・デザイン実装指示＋メタ要件｜統合版｜白・黒・グレー限定｜コピペ可）

> 目的：既存の機能要件（Googleカレンダー二系統同期＋LINE通知）に対し、**「ミニマリストしぶ」**のUIを **白・黒・グレーのみ**でデザインし、Next.js + Tailwind + shadcn/ui + Framer Motion で**実装**する。  
> さらに、本ドキュメント（要件定義）を**単一ファイル**で保持し、誰でも「今なにをしていて、次になにをすればいいか」を**中学生でもわかる言葉**で即確認・再開できる**メタ要件（U〜Z章）**を組み込む。  
> Windsurfは**非エンジニアが操作**する前提とし、**各フェーズのはじめに必ず**「①いまやること（かんたん説明）」「②終わったらどうなる？」「③次にやること（かんたん説明）」の3点を**中学生にも伝わる文章**で表示・出力すること。

## 0) デザイン原則（固定・必読）
- **色は白・黒・グレーのみ**：白(#FFFFFF)／黒(#111111)／グレー（#222,#444,#777,#E5E7EB）。**アクセント色は使わない**。  
- 余白たっぷり・情報は3層（見出し／本文／補助）。  
- 動きは短く静か（200–250ms）。  
- 可読性最優先：Noto Sans JP / Inter。  
- アクセシビリティ：コントラスト4.5:1以上、フォーカスリング常時可視。

## 1) 依頼内容（Windsurfの役割：非エンジニア向け説明を必須）
> 各フェーズの冒頭に**3点説明**（①いまやること／②終わったらどうなる？／③次にやること）を**平易な日本語**で必ず出力。

### A. デザインシステム（Tokens/Tailwind/shadcn/Framer）
- `globals.css` にモノクロのCSS変数、`tailwind.config.ts` 反映、shadcnを**白黒グレーのみ**に調整、簡易モーションユーティリティ、A11y対応。  
- 出力：設定ファイル一式**フル**。

### B. コンポーネント
- BrandHeader / PageShell / SectionTitle / PrimaryButton / GhostIconButton / FormField / StatusBadge / ScheduleListItem / EmptyState / Skeletons / Toast（すべて**モノクロ**）。  
- 出力：各`.tsx`**フル**、`aria-*`/キーボード操作。

### C. ページ（LIFF：受講生）
- `/liff/sessions`（一覧＋新規）、`/liff/sessions/new`（翌日またぎOK、**4h未満は中間グレーで注意**）、`/liff/sessions/[id]/edit`、freeBusy簡易表示。  
- 出力：App Router＋サーバ/クライアント構成**フル**。

### D. ページ（管理）
- `/admin/sessions`（同期ステータス・再送/再同期）、`/admin/failures`（DLQ再送）、`/admin/settings/notifications`、`/admin/auth`（再認可）、RBAC。  
- 出力：各ページ**フル**。

### E. コピー＆マイクロ文言
- 動詞で短く：予約する／再同期する。  
- 例：空状態「今日は静かです。予定を入れてみましょう。」／完了「保存しました」／注意「合計4時間未満です」。  
- 文体は常体、句読点「。」、英数半角。

## 2) スタイル・レイアウト仕様
- 背景`--paper`、本文`--ink-2`、見出し`--ink`。  
- 余白：上下48px、セクション32px、要素12–16px。  
- カード：角丸2xl、`shadow-sm`のみ。  
- ナビ：高さ56px、影なし。  
- 表：1px `--border`、hoverは`--paper-2`。  
- ダークモード：`.dark`で反転。  
- **禁止**：色追加・強い影・長すぎるアニメ・有彩色アイコン。

## 3) 受け入れ基準（DoD）
- Lighthouse A11y≥95、Contrast全パス。  
- 初回視線のZ字1往復以内。  
- 主要ボタンのフォーカスリング常時可視。  
- 5状態（4h未満注意／空／0件／Skeleton／エラー）再現。  
- 各フェーズ出力は**ファイル一覧→フルコード→起動/確認→チェックリスト**＋**非エンジニア3点説明**付き。

## 4) 実行・確認
- 起動：`pnpm --filter web dev`。  
- 期待：白×黒×グレー、HMRで即反映、`/admin/sessions`は行間広め。

## 5) 出力形式（毎フェーズ共通）
- ①ファイル/ディレクトリ一覧  
- ②各ファイルのフルコード（省略なし）  
- ③実行/ビルド/確認コマンド  
- ④スクショ代替の記述（レイアウト/余白/色）  
- ⑤チェックリスト（DoD自己確認）  
- ⑥非エンジニア向け3点説明

---

# （U〜Z）プロジェクト記憶／進捗リスタート要件（単一ファイル運用）

## U. 単一原本ファイル
- ルート **`/PROJECT.md`**（本ドキュメント全文）。  
- 固定見出し：Goal／Scope／フェーズ進捗（A〜E）／決定事項／未解決・リスク／**次にやることTop3（中学生向け説明つき）**／Runbookリンク／変更履歴。  
- PRマージ時に**必ず更新**。

## V. 進捗の即時回答I/F（CLI / API / UI）
- CLI：`pnpm progress now` → 平易な日本語で  
  - いまの段階／いまやること／終わるとどうなる？／次にやること  
- API：`GET /admin/progress`（JWT, read-only）。  
- 管理UI：`/admin/progress` に進捗バー＋**3点説明**（閲覧専用）。

## W. 機械可読とCI強制
- `ops/progress.yaml`（`phase`, `completed_checklist`, `next_actions`, `risks`）。  
- GitHub Action が `progress.yaml`→`PROJECT.md`を自動整合、更新なければPRをfail。  
- フェーズ完了で `phase-X-done` タグを付与。

## X. 受け入れ基準（SLO）
- CLI/API/UIいずれでも**5秒以内**に同一内容を返し、**中学生向け3点説明**を表示。  
- `PROJECT.md` と `progress.yaml` は常に一致。  
- 新規参加者が**15分以内**に動作確認→次アクション着手。

## Y. セキュリティ/権限
- `/admin/progress` は `readOnly|operator|admin` で閲覧可、編集はPRのみ。  
- SecretsはSecret Manager、進捗情報にPIIを書かない。

## Z. 実装タスク（初回）
1. `PROJECT.md` 作成（本書全文）。（完了）  
2. `ops/progress.yaml` & `ops/scripts/progress.ts`（同期スクリプト）。（完了）  
3. `GET /admin/progress` を `apps/api` に追加（60sキャッシュ）。（完了）  
4. `apps/web/app/admin/progress/page.tsx` に3点説明を常時表示。（完了）  
5. `.github/workflows/progress.yml`＆`pull_request_template.md` で更新を強制。

✅ 完了チェック（このプロンプトのDoD）
PROJECT.md・ops/progress.yaml が最初に生成される。
apps/web と apps/api がローカルで起動（/ と /healthz が見える）。
非エンジニア向け3点説明がフェーズA冒頭に必ず表示される。

⏭ 次の一手（Windsurfが終えたら直後にやること）
端末で：pnpm i → docker compose up -d → pnpm dev:web / pnpm dev:api
画面が見えたら、フェーズB（API CRUD・Zod・監査ログ）へ進むようWindsurfに指示。

- CI整合テスト: progress.yamlの変更に追随

