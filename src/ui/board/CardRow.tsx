import { getCardDef } from '../../engine/selectors'
import type { CardLevel } from '../../engine/types'
import { DevelopmentCard } from './DevelopmentCard'

interface CardRowProps {
  level: CardLevel
  visibleCardIds: (string | null)[]
  deckCount: number
  clickableCardIds?: Set<string>
  affordableCardIds?: Set<string>
  onCardClick?: (cardId: string) => void
  onDeckClick?: () => void
  deckClickable?: boolean
}

export function CardRow({
  level,
  visibleCardIds,
  deckCount,
  clickableCardIds,
  affordableCardIds,
  onCardClick,
  onDeckClick,
  deckClickable,
}: CardRowProps) {
  return (
    <div className="card-row">
      <div
        className={`card-row__deck card-row__deck--level-${level}`}
        onClick={deckClickable ? onDeckClick : undefined}
        role={deckClickable ? 'button' : undefined}
      >
        {deckCount}
      </div>
      <div className="card-row__cards">
        {visibleCardIds.map((cardId, index) =>
          cardId ? (
            <DevelopmentCard
              key={cardId}
              card={getCardDef(cardId)}
              clickable={clickableCardIds?.has(cardId)}
              affordable={affordableCardIds ? affordableCardIds.has(cardId) : true}
              onClick={() => onCardClick?.(cardId)}
            />
          ) : (
            <div key={`empty-${level}-${index}`} className="dev-card" aria-hidden="true" />
          )
        )}
      </div>
    </div>
  )
}
