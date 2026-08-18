import { GemIcon } from '../shared/GemIcon'
import type { NobleDef, TokenColor } from '../../engine/types'

interface NobleTileProps {
  noble: NobleDef
  claimable?: boolean
  onClick?: () => void
}

export function NobleTile({ noble, claimable, onClick }: NobleTileProps) {
  return (
    <button
      type="button"
      className={`noble-tile${claimable ? ' noble-tile--claimable' : ''}`}
      onClick={claimable ? onClick : undefined}
      disabled={!claimable}
    >
      <span>{noble.points} pts</span>
      <span className="noble-tile__requirement">
        {(Object.entries(noble.requirement) as [TokenColor, number][]).map(([color, amount]) => (
          <span key={color} title={`${amount} ${color}`}>
            <GemIcon color={color} size="small" />
          </span>
        ))}
      </span>
    </button>
  )
}
