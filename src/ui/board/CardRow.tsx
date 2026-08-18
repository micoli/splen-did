import { getCardDef } from '../../engine/selectors'
import type { CardLevel } from '../../engine/types'
import { DevelopmentCard } from './DevelopmentCard'

interface CardRowProps {
  level: CardLevel
  visibleCardIds: (string | null)[]
  clickableCardIds?: Set<string>
  affordableCardIds?: Set<string>
  onCardClick?: (cardId: string) => void
  onDeckClick?: () => void
  deckClickable?: boolean
}

export function CardRow({
  level,
  visibleCardIds,
  clickableCardIds,
  affordableCardIds,
  onCardClick,
  onDeckClick,
  deckClickable,
}: CardRowProps) {
  return (
    <div className={`card-row card-row--level-${level}`}>
      {deckClickable && (
        <button type="button" className="card-row__deck-reserve" onClick={onDeckClick}>
          Piocher
        </button>
      )}
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
            <div key={`empty-${index}`} className="dev-card" aria-hidden="true" />
          )
        )}
      </div>
    </div>
  )
}
