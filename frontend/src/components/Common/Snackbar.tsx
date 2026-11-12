import type { SnackbarAction } from '../../contexts/SnackbarProvider'

type Props = {
  message: string
  action?: SnackbarAction
  onClose: () => void
}

/** 画面左下の通知．状態は持たず，出す・消すは Provider が決める */
function Snackbar({ message, action, onClose }: Props) {
  return (
    <div className="snackbar" role="status">
      <span>{message}</span>
      {action && (
        <button
          className="snackbar-action"
          onClick={() => {
            action.onClick()
            onClose()  // 押したあとに残っていると二重に押せる
          }}
        >
          {action.label}
        </button>
      )}
      <button className="snackbar-close" onClick={onClose} aria-label="閉じる">
        ×
      </button>
    </div>
  )
}

export default Snackbar
