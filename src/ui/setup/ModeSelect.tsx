import { useLanguage } from '../../i18n/LanguageContext'
import type { Translations } from '../../i18n/translations'

export type GameMode = 'solo' | 'hotseat' | 'p2p'

interface ModeSelectProps {
  mode: GameMode
  onSelect: (mode: GameMode) => void
}

const MODE_OPTIONS: { mode: GameMode; icon: string; label: (t: Translations) => string }[] = [
  { mode: 'solo', icon: '\u{1F916}', label: (t) => t.modeSolo },
  { mode: 'hotseat', icon: '\u{1F465}', label: (t) => t.modeHotseat },
  { mode: 'p2p', icon: '\u{1F310}', label: (t) => t.modeOnline },
]

export function ModeSelect({ mode, onSelect }: ModeSelectProps) {
  const { t } = useLanguage()
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
          {option.label(t)}
        </button>
      ))}
    </div>
  )
}
