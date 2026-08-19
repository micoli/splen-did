import type { CardLevel, GameState } from '../../engine/types'
import { CardRow } from './CardRow'

interface CardGridProps {
  visibleCards: GameState['visibleCards']
  deckCounts?: Record<CardLevel, number>
  clickableCardIds?: Set<string>
  affordableCardIds?: Set<string>
  onCardClick?: (cardId: string) => void
  clickableDeckLevels?: Set<CardLevel>
  onDeckClick?: (level: CardLevel) => void
  highlightedSlot?: { level: CardLevel; index: number }
}

export function CardGrid({
  visibleCards,
  deckCounts,
  clickableCardIds,
  affordableCardIds,
  onCardClick,
  clickableDeckLevels,
  onDeckClick,
  highlightedSlot,
}: CardGridProps) {
  return (
    <div className="card-grid board-panel">
      {([3, 2, 1] as CardLevel[]).map((level) => (
        <CardRow
          key={level}
          level={level}
          visibleCardIds={visibleCards[level]}
          deckCount={deckCounts?.[level]}
          clickableCardIds={clickableCardIds}
          affordableCardIds={affordableCardIds}
          onCardClick={onCardClick}
          deckClickable={clickableDeckLevels?.has(level)}
          onDeckClick={() => onDeckClick?.(level)}
          highlightedIndex={highlightedSlot?.level === level ? highlightedSlot.index : undefined}
        />
      ))}
    </div>
  )
}
