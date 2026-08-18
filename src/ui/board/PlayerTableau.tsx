import { GemIcon } from '../shared/GemIcon'
import { TOKEN_COLORS } from '../../engine/types'
import type { PlayerState } from '../../engine/types'

interface PlayerTableauProps {
  tokens: PlayerState['tokens']
  bonuses: PlayerState['bonuses']
}

/** One column per color so held tokens and owned-card bonuses line up for direct comparison. */
export function PlayerTableau({ tokens, bonuses }: PlayerTableauProps) {
  return (
    <div className="player-panel__tableau">
      {TOKEN_COLORS.map((color) => (
        <div key={color} className="player-panel__color-column">
          <GemIcon color={color} size="small" count={tokens[color]} />
          <span className="player-panel__bonus-count">{bonuses[color] > 0 ? `+${bonuses[color]}` : ''}</span>
        </div>
      ))}
      {tokens.gold > 0 && (
        <div className="player-panel__color-column">
          <GemIcon color="gold" size="small" count={tokens.gold} />
          <span className="player-panel__bonus-count" />
        </div>
      )}
    </div>
  )
}
