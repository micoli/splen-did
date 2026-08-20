import { useLanguage } from '../../i18n/LanguageContext'

interface RestartPromptModalProps {
  message: string
  onAccept: () => void
  onDecline: () => void
}

export function RestartPromptModal({ message, onAccept, onDecline }: RestartPromptModalProps) {
  const { t } = useLanguage()
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{t.restartTitle}</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" onClick={onAccept}>
            {t.restartAccept}
          </button>
          <button type="button" onClick={onDecline}>
            {t.restartDecline}
          </button>
        </div>
      </div>
    </div>
  )
}
