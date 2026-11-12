import { useState } from 'react'
import {
  createTask,
  ValidationError,
  type FieldErrors,
  type Task,
} from '../../api/tasks'

/** モーダルを開くときに渡す「どこに置くか」．Phase B では startTime が増える */
export type Placement = { date: string }

type Props = {
  placement: Placement
  onCreated: (task: Task) => void
  onCancel: () => void
}

/** タスクを1件追加するフォーム．置き場所を初期値として受け取る */
function TaskForm({ placement, onCreated, onCancel }: Props) {
  // 日付も入力項目にする．画面に出ていない日にも追加できるようにするため
  const [date, setDate] = useState(placement.date)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [minutes, setMinutes] = useState('60')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    setError(null)
    try {
      const created = await createTask({
        title,
        description: description === '' ? null : description,
        minutes: Number(minutes),
        scheduledDate: date,
      })
      onCreated(created)
    } catch (e) {
      // 400 のときは閉じない．項目ごとのメッセージを出して直してもらう
      if (e instanceof ValidationError) {
        setFieldErrors(e.fields)
      } else {
        setError((e as Error).message)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="add" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <label>
        日付
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <label>
        タスク名
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
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

      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
        <button type="submit" disabled={saving}>
          {saving ? '追加中…' : '追加'}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
