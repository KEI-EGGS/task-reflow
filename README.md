# task-reflow

週のタスクを「時間の上に置く」ためのタスク管理アプリ．
ToDo リストと違い，稼働時間と固定イベントの**合間にタスクを流し込む（reflow）**ことを目標にしている．

**公開 URL：** https://task-reflow.onrender.com
（無料プランのため，しばらくアクセスが無いと停止する．最初の表示に 45 秒ほどかかる）

<!-- スクリーンショット：docs/screenshot-week.png を置いたら下のコメントを外す -->
<!-- ![週表示](docs/screenshot-week.png) -->

## いまできること（Phase A）

- 月曜はじまりの 7 列で今週のタスクを一覧する．0 件の日も列が残り，今日の列は色が変わる
- ← → で前後の週へ移る．「今週へ」で戻る
- 列の空き領域か上部の「＋ 追加」からモーダルで追加する．日付は変更でき，表示中の週の外にも置ける
- 追加・完了チェック・削除．入力の検証エラーは項目の下に出て，モーダルは閉じない
- 操作結果を左下の通知で知らせる．週の外に追加したときは「その週へ移動」で飛べる

## 構成

```
frontend/   React 19 + TypeScript + Vite
backend/    Spring Boot 4 (Java 21) + PostgreSQL
Dockerfile  3 段ビルド．フロントの成果物を Spring Boot の static/ に入れ，jar 1 つで配信する
```

| | |
|---|---|
| アプリ | Render（Web Service・無料プラン） |
| DB | Neon（PostgreSQL・無料プラン） |
| 配信 | フロントとバックエンドを同一オリジンで配信するので CORS の設定が要らない |

### API

```
GET    /api/tasks?from=&to=   期間のタスク一覧（両端を含む．from > to は 400）
POST   /api/tasks             追加（Bean Validation．項目ごとのエラーを返す）
PUT    /api/tasks/{id}        更新
DELETE /api/tasks/{id}        削除
```

### フロントの構成

```
src/
├── api/tasks.ts            fetch の薄い層．400 は ValidationError として項目ごとに持つ
├── functions/week.ts       週の計算（月曜はじまり・ローカル日付で組み立てる）
├── components/Week/        DayColumn ・ TaskForm
├── components/Common/      Modal ・ Snackbar
└── contexts/               SnackbarProvider（通知を 1 か所で持ち useSnackbar() で出す）
```

## 動かし方

```
# backend（PostgreSQL が localhost:5432 に要る．表は backend/src/main/resources/schema.sql を手で流す）
cd backend && ./gradlew bootRun            # localhost:8080

# frontend（/api を 8080 にプロキシする）
cd frontend && npm install && npm run dev  # localhost:5173
```

本番と同じ構成を手元で試す：

```
docker build -t task-reflow .
docker run --rm -p 8080:8080 \
  -e SPRING_DATASOURCE_URL='jdbc:postgresql://<host>/<db>?sslmode=require' \
  -e SPRING_DATASOURCE_USERNAME=... -e SPRING_DATASOURCE_PASSWORD=... \
  task-reflow
```

`spring.sql.init.mode=never` にしてあるので，アプリは表を作らない（always だと起動のたびにデータが消えるため）．

## これから

| Phase | やること |
|---|---|
| **B** | 曜日ごとの稼働時間・固定イベントの API と，時間軸グリッドへの表示 |
| **C** | **タスクの合間配置（reflow）と，入りきらない分の自動スライド** ── このアプリの核心 |
| **D** | ログインなどのユーザー機能（いまはユーザーが固定） |

## 設計の記録

要件 → 設計 → タスク分解を `.specs/<機能名>/` に残し，実装はタスク単位で計画をレビューしてから書いている．
判断の経緯は `docs/` にある．
