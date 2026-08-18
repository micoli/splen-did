import { getNobleDef } from '../../engine/selectors'
import type { CardLevel } from '../../engine/types'
import { NobleTile } from './NobleTile'

interface NobleRowProps {
  nobleIds: string[]
  deckCounts?: Record<CardLevel, number>
  claimableNobleIds?: string[]
  onClaim?: (nobleId: string) => void
}

export function NobleRow({ nobleIds, deckCounts, claimableNobleIds, onClaim }: NobleRowProps) {
  return (
    <div className="noble-row-panel">
      <div className="noble-row">
        {nobleIds.map((id) => (
          <NobleTile
            key={id}
            noble={getNobleDef(id)}
            claimable={claimableNobleIds?.includes(id)}
            onClick={() => onClaim?.(id)}
          />
        ))}
      </div>
      {deckCounts && (
        <div className="noble-row__deck-counts">
          {([1, 2, 3] as CardLevel[]).map((level) => (
            <span key={level} className={`noble-row__deck-count noble-row__deck-count--level-${level}`}>
              {deckCounts[level]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
