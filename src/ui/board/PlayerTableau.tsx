import { GemIcon } from '../shared/GemIcon'
import { TOKEN_COLORS } from '../../engine/types'
import type { PlayerState } from '../../engine/types'

interface PlayerTableauProps {
  bonuses: PlayerState['bonuses']
}

export function PlayerTableau({ bonuses }: PlayerTableauProps) {
  return (
    <div className="player-panel__bonuses">
      {TOKEN_COLORS.filter((color) => bonuses[color] > 0).map((color) => (
        <span key={color} title={`${bonuses[color]} ${color} bonus cards`}>
          <GemIcon color={color} size="small" /> {bonuses[color]}
        </span>
      ))}
    </div>
  )
}
