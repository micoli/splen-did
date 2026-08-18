import { playerPrestige } from '../../engine/selectors'
import type { GameState } from '../../engine/types'

interface GameOverScreenProps {
  state: GameState
  onRematch: () => void
}

export function GameOverScreen({ state, onRematch }: GameOverScreenProps) {
  const ranked = [...state.players].sort((a, b) => playerPrestige(b) - playerPrestige(a))

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Partie terminee</h3>
        <ol>
          {ranked.map((player) => (
            <li key={player.id}>
              {player.name} - {playerPrestige(player)} pts ({player.ownedCardIds.length} cartes)
              {player.id === state.winnerId ? ' - Vainqueur' : ''}
            </li>
          ))}
        </ol>
        <button type="button" className="btn-primary" onClick={onRematch}>
          Nouvelle partie
        </button>
      </div>
    </div>
  )
}
