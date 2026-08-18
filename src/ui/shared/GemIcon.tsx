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
}

export function GemIcon({ color, size = 'medium' }: GemIconProps) {
  return (
    <span className={`gem-icon gem-icon--${color} gem-icon--${size}`} aria-label={color}>
      {GEM_LABELS[color]}
    </span>
  )
}
