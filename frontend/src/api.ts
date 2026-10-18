// バックエンドの URL．開発中は Vite のプロキシ経由なので同一オリジンとして書ける
const BASE = "/api";

/** tasks テーブルの1行．バックエンドの Task レコードと対応する */
export type Task = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  position: number;
  minutes: number;
  scheduledDate: string; // "2026-10-18"
  status: "todo" | "done" | "carryover";
  createdAt: string;
};

/** 指定した日のタスクを position 順で取得する */
export async function fetchTasks(date: string): Promise<Task[]> {
  const res = await fetch(`${BASE}/tasks?date=${date}`);
  if (!res.ok) {
    throw new Error(`タスクの取得に失敗しました（${res.status}）`);
  }
  return res.json();
}

/** タスク作成時に送る本文．id・userId・position はサーバーが決めるので送らない */
export type TaskCreateRequest = {
  title: string;
  description: string | null;
  minutes: number;
  scheduledDate: string;
};

/** 項目名 → エラーメッセージ．バックエンドが 400 で返す形 */
export type FieldErrors = Record<string, string>;

/** 検証に失敗したことを，項目ごとのメッセージ付きで伝える例外 */
export class ValidationError extends Error {
  readonly fields: FieldErrors;

  constructor(fields: FieldErrors) {
    super("入力内容を確認してください");
    this.fields = fields;
  }
}

/** タスクを1件追加し，DB が確定させた値を含むタスクを返す */
export async function createTask(req: TaskCreateRequest): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  // 400 のときだけ本文が {項目名: メッセージ} なので，専用の例外に詰め替える
  if (res.status === 400) {
    throw new ValidationError(await res.json());
  }
  if (!res.ok) {
    throw new Error(`タスクの追加に失敗しました（${res.status}）`);
  }
  return res.json();
}

/** タスク更新時に送る本文．PUT は全置換なので，変えない項目も現在の値を送る */
export type TaskUpdateRequest = {
  title: string;
  description: string | null;
  minutes: number;
  status: Task["status"];
};

/** タスクを1件書き換え，書き換えた後のタスクを返す */
export async function updateTask(
  id: number,
  req: TaskUpdateRequest,
): Promise<Task> {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (res.status === 400) {
    throw new ValidationError(await res.json());
  }
  if (!res.ok) {
    throw new Error(`タスクの更新に失敗しました（${res.status}）`);
  }
  return res.json();
}

/** タスクを1件削除する．成功しても本文は返らない（204） */
export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${BASE}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`タスクの削除に失敗しました（${res.status}）`);
  }
}
