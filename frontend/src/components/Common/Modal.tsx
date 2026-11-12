import { useEffect, type ReactNode } from 'react'

type Props = {
  title: string
  /** Esc・背景クリック・× のいずれでも呼ばれる */
  onClose: () => void
  children: ReactNode
}

/**
 * 画面を覆う枠だけを提供する．中身が何かは知らない．
 * Phase B で固定イベントのフォームを足すときも，この殻は変えない．
 */
function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    // 背景のクリックで閉じる．中身のクリックは伝播を止めるので閉じない
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}

export default Modal
