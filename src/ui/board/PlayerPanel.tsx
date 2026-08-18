import { playerPrestige } from '../../engine/selectors'
import { TOKEN_COLORS } from '../../engine/types'
import type { PlayerState } from '../../engine/types'
import { GemIcon } from '../shared/GemIcon'
import { PrestigeBadge } from '../shared/PrestigeBadge'
import { PlayerTableau } from './PlayerTableau'
import { ReservedCards } from './ReservedCards'

interface PlayerPanelProps {
  player: PlayerState
  isActive: boolean
  clickableReservedCardIds?: Set<string>
  affordableReservedCardIds?: Set<string>
  onReservedCardClick?: (cardId: string) => void
}

export function PlayerPanel({
  player,
  isActive,
  clickableReservedCardIds,
  affordableReservedCardIds,
  onReservedCardClick,
}: PlayerPanelProps) {
  return (
    <div className={`player-panel${isActive ? ' player-panel--active' : ''}`}>
      <div className="player-panel__header">
        <strong>{player.name}</strong>
        <PrestigeBadge points={playerPrestige(player)} />
      </div>
      <div className="player-panel__tokens">
        {TOKEN_COLORS.filter((color) => player.tokens[color] > 0).map((color) => (
          <span key={color}>
            <GemIcon color={color} size="small" /> {player.tokens[color]}
          </span>
        ))}
        {player.tokens.gold > 0 && (
          <span>
            <GemIcon color="gold" size="small" /> {player.tokens.gold}
          </span>
        )}
      </div>
      <PlayerTableau bonuses={player.bonuses} />
      <ReservedCards
        cardIds={player.reservedCardIds}
        revealed
        clickableCardIds={clickableReservedCardIds}
        affordableCardIds={affordableReservedCardIds}
        onCardClick={onReservedCardClick}
      />
    </div>
  )
}
