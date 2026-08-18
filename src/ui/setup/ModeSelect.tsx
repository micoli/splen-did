export type GameMode = 'solo' | 'hotseat' | 'p2p'

interface ModeSelectProps {
  mode: GameMode
  onSelect: (mode: GameMode) => void
}

export function ModeSelect({ mode, onSelect }: ModeSelectProps) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <button type="button" className={mode === 'solo' ? 'active' : ''} onClick={() => onSelect('solo')}>
        Solo vs IA
      </button>
      <button type="button" className={mode === 'hotseat' ? 'active' : ''} onClick={() => onSelect('hotseat')}>
        Local (pass-and-play)
      </button>
      <button type="button" className={mode === 'p2p' ? 'active' : ''} onClick={() => onSelect('p2p')}>
        En ligne (P2P)
      </button>
    </div>
  )
}
