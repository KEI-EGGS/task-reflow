import type { Task } from '../../api/tasks'

/** 列の見出しに出す曜日．週は月曜はじまりで固定する */
const WEEKDAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']

/** "2026-10-19" → "10/19" */
function toMonthDay(isoDate: string): string {
  const [, month, day] = isoDate.split('-')
  return `${Number(month)}/${Number(day)}`
}

type Props = {
  /** この列の日付．yyyy-MM-dd */
  date: string
  /** 月曜からの位置．曜日の見出しを引くのに使う */
  dayIndex: number
  /** この日のタスク．position 順で渡される */
  tasks: Task[]
  isToday: boolean
  onToggleDone: (task: Task) => void
  onRemove: (task: Task) => void
  /** 列の空き領域がクリックされたとき．この列の日付を渡す */
  onAdd: (date: string) => void
}

/** 週表示の1列．1日ぶんのタスクを縦に並べる */
function DayColumn({
  date,
  dayIndex,
  tasks,
  isToday,
  onToggleDone,
  onRemove,
  onAdd,
}: Props) {
  return (
    <section
      className={isToday ? 'day today' : 'day'}
      onClick={() => onAdd(date)}
    >
      <header>
        <span className="weekday">{WEEKDAY_LABELS[dayIndex]}</span>
        <span className="date">{toMonthDay(date)}</span>
      </header>

      {/* タスクの上のクリックは追加として扱わない */}
      <ul className="tasks" onClick={(e) => e.stopPropagation()}>
        {tasks.map((task) => (
          <li key={task.id} className={task.status === 'done' ? 'done' : ''}>
            <input
              type="checkbox"
              checked={task.status === 'done'}
              onChange={() => onToggleDone(task)}
            />
            <span className="title">{task.title}</span>
            <span className="minutes">{task.minutes}分</span>
            <button className="remove" onClick={() => onRemove(task)}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default DayColumn
