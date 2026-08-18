interface RestartPromptModalProps {
  message: string
  onAccept: () => void
  onDecline: () => void
}

export function RestartPromptModal({ message, onAccept, onDecline }: RestartPromptModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Redemarrer la partie ?</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={onAccept}>
            Accepter
          </button>
          <button type="button" onClick={onDecline}>
            Refuser
          </button>
        </div>
      </div>
    </div>
  )
}
