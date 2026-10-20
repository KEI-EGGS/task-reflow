import { useEffect, useState } from 'react'
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  ValidationError,
  type FieldErrors,
  type Task,
} from './api'
import './App.css'

/** 画面に出す日付．日付の切り替えは後のブロックで足す */
const DATE = '2026-10-18'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  // 取得中かどうか．初回は true から始める
  const [loading, setLoading] = useState(true)

  // 追加フォームの入力値．minutes も文字列で持つ（空欄を表せるようにするため）
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [minutes, setMinutes] = useState('60')
  // 項目ごとのエラー．送信のたびに入れ替える
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  // 二重送信を防ぐ
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTasks(DATE)
      .then(setTasks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // ページ遷移を止める
    setSaving(true)
    setFieldErrors({})
    try {
      const created = await createTask({
        title,
        description: description === '' ? null : description,
        minutes: Number(minutes),
        scheduledDate: DATE,
      })
      // サーバーが採番した position つきで返るので，そのまま末尾に足す
      setTasks([...tasks, created])
      setTitle('')
      setDescription('')
    } catch (e) {
      if (e instanceof ValidationError) {
        setFieldErrors(e.fields)
      } else {
        setError((e as Error).message)
      }
    } finally {
      setSaving(false)
    }
  }

  /** チェックの付け外し．todo ⇄ done を入れ替えて PUT する */
  async function toggleDone(task: Task) {
    try {
      const updated = await updateTask(task.id, {
        title: task.title,
        description: task.description,
        minutes: task.minutes,
        status: task.status === 'done' ? 'todo' : 'done',
      })
      // 書き換えた1件だけ差し替える
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function remove(task: Task) {
    try {
      await deleteTask(task.id)
      setTasks(tasks.filter((t) => t.id !== task.id))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <main>
      <h1>{DATE} のタスク</h1>

      {loading && <p>読み込み中…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p>この日のタスクはまだありません</p>
      )}

      <ul className="tasks">
        {tasks.map((task) => (
          <li key={task.id} className={task.status === 'done' ? 'done' : ''}>
            <input
              type="checkbox"
              checked={task.status === 'done'}
              onChange={() => toggleDone(task)}
            />
            <span className="title">{task.title}</span>
            <span className="minutes">{task.minutes}分</span>
            <button className="remove" onClick={() => remove(task)}>
              削除
            </button>
          </li>
        ))}
      </ul>

      <form className="add" onSubmit={handleSubmit}>
        <label>
          タスク名
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          {fieldErrors.title && <span className="error">{fieldErrors.title}</span>}
        </label>

        <label>
          補足（任意）
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          見積もり（分）
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
          {fieldErrors.minutes && (
            <span className="error">{fieldErrors.minutes}</span>
          )}
        </label>

        <button type="submit" disabled={saving}>
          {saving ? '追加中…' : '追加'}
        </button>
      </form>
    </main>
  )
}

export default App
