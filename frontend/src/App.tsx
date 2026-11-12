import { useEffect, useState } from 'react'
import {
  deleteTask,
  fetchTasksInRange,
  updateTask,
  type Task,
} from './api/tasks'
import { fromISODate, shiftDays, toISODate, weekOf } from './functions/week'
import DayColumn from './components/Week/DayColumn'
import TaskForm, { type Placement } from './components/Week/TaskForm'
import Modal from './components/Common/Modal'
import { useSnackbar } from './contexts/SnackbarProvider'
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
  // 表示している週を代表する日．← → でこの日を ±7 日ずらす
  const [anchor, setAnchor] = useState(() => new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  // null のときモーダルは閉じている．開くときは「どこに置くか」を入れる
  const [placement, setPlacement] = useState<Placement | null>(null)
  const snackbar = useSnackbar()

  const week = weekOf(anchor)
  const today = toISODate(new Date())
  const byDate = groupByDate(tasks)
  // 今日がこの週に含まれていれば「今週へ」は出さない
  const isThisWeek = week.days.includes(today)

  useEffect(() => {
    // 週を素早く切り替えると取得が並走し，返る順番は保証されない．
    // この effect が最新かどうかを印として持ち，古い応答では state を触らない
    let current = true
    setLoading(true)
    setError(null)
    fetchTasksInRange(week.from, week.to)
      .then((fetched) => {
        if (current) setTasks(fetched)
      })
      .catch((e: Error) => {
        if (current) setError(e.message)
      })
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => {
      current = false
    }
    // week は毎回新しいオブジェクトになるので，中身の文字列を依存に使う
  }, [week.from, week.to])

  /**
   * 追加に成功したときの反映．表示中の週の内ならその列に足し，
   * 外なら画面は動かさず，通知のボタンでその週へ移れるようにする
   */
  function handleCreated(created: Task) {
    const inThisWeek =
      created.scheduledDate >= week.from && created.scheduledDate <= week.to
    if (inThisWeek) {
      setTasks([...tasks, created])
      snackbar.show(`${created.scheduledDate} に追加しました`)
    } else {
      snackbar.show(`${created.scheduledDate} に追加しました（表示中の週の外）`, {
        label: 'その週へ移動',
        onClick: () => setAnchor(fromISODate(created.scheduledDate)),
      })
    }
    setPlacement(null)
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
      <header className="week-nav">
        <button onClick={() => setAnchor(shiftDays(anchor, -7))}>←</button>
        <h1>
          {week.from} 〜 {week.to}
        </h1>
        <button onClick={() => setAnchor(shiftDays(anchor, 7))}>→</button>
        {!isThisWeek && (
          <button onClick={() => setAnchor(new Date())}>今週へ</button>
        )}
        <button onClick={() => setPlacement({ date: today })}>＋ 追加</button>
      </header>

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
              onAdd={(date) => setPlacement({ date })}
            />
          ))}
        </div>
      </div>

      {placement && (
        <Modal title="タスクを追加" onClose={() => setPlacement(null)}>
          <TaskForm
            placement={placement}
            onCreated={handleCreated}
            onCancel={() => setPlacement(null)}
          />
        </Modal>
      )}
    </main>
  )
}

export default App
