import { GemIcon } from '../shared/GemIcon'
import type { Token } from '../../engine/types'

interface TokenPileProps {
  color: Token
  count: number
  selected?: boolean
  onClick?: () => void
}

export function TokenPile({ color, count, selected, onClick }: TokenPileProps) {
  const classes = ['token-pile']
  if (onClick) classes.push('token-pile--selectable')
  if (selected) classes.push('token-pile--selected')

  return (
    <button type="button" className={classes.join(' ')} onClick={onClick} disabled={!onClick}>
      <GemIcon color={color} size="large" />
      <span className="token-pile__count">{count}</span>
    </button>
  )
}
