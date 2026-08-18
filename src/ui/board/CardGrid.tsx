import type { CardLevel, GameState } from '../../engine/types'
import { CardRow } from './CardRow'

interface CardGridProps {
  visibleCards: GameState['visibleCards']
  decks: GameState['decks']
  clickableCardIds?: Set<string>
  affordableCardIds?: Set<string>
  onCardClick?: (cardId: string) => void
  clickableDeckLevels?: Set<CardLevel>
  onDeckClick?: (level: CardLevel) => void
}

export function CardGrid({
  visibleCards,
  decks,
  clickableCardIds,
  affordableCardIds,
  onCardClick,
  clickableDeckLevels,
  onDeckClick,
}: CardGridProps) {
  return (
    <div className="card-grid">
      {([3, 2, 1] as CardLevel[]).map((level) => (
        <CardRow
          key={level}
          level={level}
          visibleCardIds={visibleCards[level]}
          deckCount={decks[level].length}
          clickableCardIds={clickableCardIds}
          affordableCardIds={affordableCardIds}
          onCardClick={onCardClick}
          deckClickable={clickableDeckLevels?.has(level)}
          onDeckClick={() => onDeckClick?.(level)}
        />
      ))}
    </div>
  )
}
