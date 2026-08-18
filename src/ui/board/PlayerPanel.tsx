import { playerPrestige } from '../../engine/selectors'
import type { PlayerState } from '../../engine/types'
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
      <PlayerTableau tokens={player.tokens} bonuses={player.bonuses} />
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
