import { getCardDef } from '../../engine/selectors'
import type { CardLevel } from '../../engine/types'
import { DevelopmentCard } from './DevelopmentCard'

interface CardRowProps {
  level: CardLevel
  visibleCardIds: (string | null)[]
  deckCount?: number
  clickableCardIds?: Set<string>
  affordableCardIds?: Set<string>
  onCardClick?: (cardId: string) => void
  onDeckClick?: () => void
  deckClickable?: boolean
  highlightedIndex?: number
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
  highlightedIndex,
}: CardRowProps) {
  return (
    <div className={`card-row card-row--level-${level}`}>
      {deckCount !== undefined && (
        <span className={`card-row__deck-count card-row__deck-count--level-${level}`}>{deckCount}</span>
      )}
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
              purchasable={affordableCardIds?.has(cardId)}
              onClick={() => onCardClick?.(cardId)}
              highlighted={highlightedIndex === index}
            />
          ) : (
            <div key={`empty-${index}`} className="dev-card" aria-hidden="true" />
          )
        )}
      </div>
    </div>
  )
}
