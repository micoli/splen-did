export type InteractionMode = 'idle' | 'take3' | 'take2' | 'reserve' | 'purchase'

interface ActionBarProps {
  mode: InteractionMode
  onSetMode: (mode: InteractionMode) => void
  canTake3: boolean
  canTake2: boolean
  canReserve: boolean
  canPurchase: boolean
  take3Ready: boolean
  take3RequiredCount: number
  take3SelectedCount: number
  onConfirmTake3: () => void
}

export function ActionBar({
  mode,
  onSetMode,
  canTake3,
  canTake2,
  canReserve,
  canPurchase,
  take3Ready,
  take3RequiredCount,
  take3SelectedCount,
  onConfirmTake3,
}: ActionBarProps) {
  function toggle(next: InteractionMode) {
    onSetMode(mode === next ? 'idle' : next)
  }

  return (
    <div>
      <div className="action-bar">
        <button type="button" className={mode === 'take3' ? 'active' : ''} disabled={!canTake3} onClick={() => toggle('take3')}>
          Prendre 3 jetons
        </button>
        <button type="button" className={mode === 'take2' ? 'active' : ''} disabled={!canTake2} onClick={() => toggle('take2')}>
          Prendre 2 jetons
        </button>
        <button type="button" className={mode === 'reserve' ? 'active' : ''} disabled={!canReserve} onClick={() => toggle('reserve')}>
          Réserver une carte
        </button>
        <button type="button" className={mode === 'purchase' ? 'active' : ''} disabled={!canPurchase} onClick={() => toggle('purchase')}>
          Acheter une carte
        </button>
      </div>
      {mode === 'take3' && (
        <div className="action-bar__confirm">
          <button type="button" disabled={!take3Ready} onClick={onConfirmTake3}>
            Confirmer ({take3SelectedCount}/{take3RequiredCount})
          </button>
        </div>
      )}
    </div>
  )
}
