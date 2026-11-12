import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import Snackbar from '../components/Common/Snackbar'

/** 通知に添えるボタン．押すと onClick を呼び，通知も閉じる */
export type SnackbarAction = { label: string; onClick: () => void }

type Notice = { message: string; action?: SnackbarAction }

type SnackbarApi = {
  /** 通知を出す．表示中なら積まずに差し替え，消えるまでの時間も測り直す */
  show: (message: string, action?: SnackbarAction) => void
}

const SnackbarContext = createContext<SnackbarApi | null>(null)

/** 画面に出す時間．読める長さで，次の操作の邪魔をしない程度 */
const DURATION_MS = 4000

/**
 * 通知の状態を1か所で持ち，画面のどこからでも useSnackbar() で出せるようにする．
 * 表示そのものは Snackbar に任せる．
 */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null)
  // 差し替えのとき前のタイマーを止めるために番号を持つ．state にすると再描画が増えるので ref
  const timer = useRef<number | undefined>(undefined)

  function close() {
    window.clearTimeout(timer.current)
    setNotice(null)
  }

  function show(message: string, action?: SnackbarAction) {
    window.clearTimeout(timer.current)
    setNotice({ message, action })
    timer.current = window.setTimeout(() => setNotice(null), DURATION_MS)
  }

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      {notice && <Snackbar message={notice.message} action={notice.action} onClose={close} />}
    </SnackbarContext.Provider>
  )
}

/** Provider の外で呼ぶと設定漏れなので，黙って動かずに落とす */
export function useSnackbar(): SnackbarApi {
  const api = useContext(SnackbarContext)
  if (!api) throw new Error('useSnackbar は SnackbarProvider の中で使う')
  return api
}
