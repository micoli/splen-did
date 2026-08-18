export type GameMode = 'solo' | 'hotseat' | 'p2p'

interface ModeSelectProps {
  mode: GameMode
  onSelect: (mode: GameMode) => void
}

const MODE_OPTIONS: { mode: GameMode; icon: string; label: string }[] = [
  { mode: 'solo', icon: '\u{1F916}', label: 'Solo vs IA' },
  { mode: 'hotseat', icon: '\u{1F465}', label: 'Local' },
  { mode: 'p2p', icon: '\u{1F310}', label: 'En ligne' },
]

export function ModeSelect({ mode, onSelect }: ModeSelectProps) {
  return (
    <div className="mode-select">
      {MODE_OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          className={`mode-select__option${mode === option.mode ? ' active' : ''}`}
          onClick={() => onSelect(option.mode)}
        >
          <span className="mode-select__icon">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  )
}
