/** 月曜はじまりの1週間．日付は API に渡せる yyyy-MM-dd 文字列で持つ */
export type Week = {
  /** 月曜から日曜までの7日 */
  days: string[]
  /** 期間の開始 ＝ days[0] */
  from: string
  /** 期間の終了 ＝ days[6] */
  to: string
}

/**
 * Date を yyyy-MM-dd にする．
 * toISOString() は UTC に変換するので，JST では9時間ぶん前日にずれる．ローカルの値から組み立てる．
 */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 指定した日を含む週（月曜はじまり）を返す */
export function weekOf(date: Date): Week {
  // getDay() は 0:日曜 〜 6:土曜．月曜を 0 にするため 6 を足して 7 で割った余りを取る
  const offsetFromMonday = (date.getDay() + 6) % 7
  const monday = new Date(date)
  monday.setDate(date.getDate() - offsetFromMonday)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    // setDate は月末を超える値を繰り上げるので，月またぎ・年またぎを自分で扱わなくてよい
    d.setDate(monday.getDate() + i)
    return toISODate(d)
  })
  return { days, from: days[0], to: days[6] }
}
