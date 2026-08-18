import { getCardDef } from '../../engine/selectors'
import { DevelopmentCard } from './DevelopmentCard'

interface ReservedCardsProps {
  cardIds: string[]
  revealed: boolean
  clickableCardIds?: Set<string>
  affordableCardIds?: Set<string>
  onCardClick?: (cardId: string) => void
}

export function ReservedCards({ cardIds, revealed, clickableCardIds, affordableCardIds, onCardClick }: ReservedCardsProps) {
  if (cardIds.length === 0) return null
  return (
    <div className="player-panel__reserved">
      {cardIds.map((cardId) => (
        <DevelopmentCard
          key={cardId}
          card={getCardDef(cardId)}
          hidden={!revealed}
          clickable={clickableCardIds?.has(cardId)}
          affordable={affordableCardIds ? affordableCardIds.has(cardId) : true}
          onClick={() => onCardClick?.(cardId)}
        />
      ))}
    </div>
  )
}
