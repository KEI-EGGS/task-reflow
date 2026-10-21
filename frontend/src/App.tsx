import { useEffect, useState } from 'react'
import {
  createTask,
  deleteTask,
  fetchTasksInRange,
  updateTask,
  ValidationError,
  type FieldErrors,
  type Task,
} from './api/tasks'
import { toISODate, weekOf } from './functions/week'
import DayColumn from './components/Week/DayColumn'
import './App.css'

/**
 * タスクを日付ごとに振り分ける．
 * API が scheduled_date 順で返すので，1周するだけで組める．
 */
function groupByDate(tasks: Task[]): Map<string, Task[]> {
  const byDate = new Map<string, Task[]>()
  for (const task of tasks) {
    const sameDay = byDate.get(task.scheduledDate)
    if (sameDay) {
      sameDay.push(task)
    } else {
      byDate.set(task.scheduledDate, [task])
    }
  }
  return byDate
}

function App() {
  // 表示している週を代表する日．週の切り替えは次のブロックで足す
  const [anchor] = useState(() => new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // 追加フォームの入力値．minutes も文字列で持つ（空欄を表せるようにするため）
  const [formDate, setFormDate] = useState(() => toISODate(new Date()))
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [minutes, setMinutes] = useState('60')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)

  const week = weekOf(anchor)
  const today = toISODate(new Date())
  const byDate = groupByDate(tasks)

  useEffect(() => {
    setLoading(true)
    fetchTasksInRange(week.from, week.to)
      .then(setTasks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
    // week は毎回新しいオブジェクトになるので，中身の文字列を依存に使う
  }, [week.from, week.to])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    try {
      const created = await createTask({
        title,
        description: description === '' ? null : description,
        minutes: Number(minutes),
        scheduledDate: formDate,
      })
      // 表示中の週の外に足したときは，画面を動かさない
      if (
        created.scheduledDate >= week.from &&
        created.scheduledDate <= week.to
      ) {
        setTasks([...tasks, created])
      }
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
      <h1>
        {week.from} 〜 {week.to}
      </h1>

      {loading && <p>読み込み中…</p>}
      {error && <p className="error">{error}</p>}

      <div className="week-scroll">
        <div className="week">
          {week.days.map((day, dayIndex) => (
            <DayColumn
              key={day}
              date={day}
              dayIndex={dayIndex}
              tasks={byDate.get(day) ?? []}
              isToday={day === today}
              onToggleDone={toggleDone}
              onRemove={remove}
            />
          ))}
        </div>
      </div>

      <form className="add" onSubmit={handleSubmit}>
        <label>
          日付
          <input
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
          />
        </label>

        <label>
          タスク名
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          {fieldErrors.title && (
            <span className="error">{fieldErrors.title}</span>
          )}
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
