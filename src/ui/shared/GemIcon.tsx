import type { Token } from '../../engine/types'
import './GemIcon.css'

const GEM_LABELS: Record<Token, string> = {
  white: 'W',
  blue: 'U',
  green: 'G',
  red: 'R',
  black: 'B',
  gold: '★',
}

interface GemIconProps {
  color: Token
  size?: 'small' | 'medium' | 'large'
  /** When set, shows this number inside the gem instead of the color letter (used for costs/holdings). */
  count?: number
}

export function GemIcon({ color, size = 'medium', count }: GemIconProps) {
  return (
    <span className={`gem-icon gem-icon--${color} gem-icon--${size}`} aria-label={count != null ? `${count} ${color}` : color}>
      {count != null ? count : GEM_LABELS[color]}
    </span>
  )
}
