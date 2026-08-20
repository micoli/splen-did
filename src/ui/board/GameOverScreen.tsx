import { playerPrestige } from '../../engine/selectors'
import type { GameState } from '../../engine/types'
import { useLanguage } from '../../i18n/LanguageContext'

interface GameOverScreenProps {
  state: GameState
  onRematch: () => void
}

export function GameOverScreen({ state, onRematch }: GameOverScreenProps) {
  const { t } = useLanguage()
  const ranked = [...state.players].sort((a, b) => playerPrestige(b) - playerPrestige(a))

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{t.gameOverTitle}</h3>
        <ol>
          {ranked.map((player) => (
            <li key={player.id}>
              {t.gameOverResult(player.name, playerPrestige(player), player.ownedCardIds.length)}
              {player.id === state.winnerId ? t.gameOverWinnerSuffix : ''}
            </li>
          ))}
        </ol>
        <button type="button" className="btn-primary" onClick={onRematch}>
          {t.newGame}
        </button>
      </div>
    </div>
  )
}
