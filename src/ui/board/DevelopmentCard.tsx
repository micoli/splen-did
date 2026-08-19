import { GemIcon } from '../shared/GemIcon'
import type { CardDef, TokenColor } from '../../engine/types'

interface DevelopmentCardProps {
  card: CardDef
  hidden?: boolean
  affordable?: boolean
  clickable?: boolean
  purchasable?: boolean
  highlighted?: boolean
  onClick?: () => void
}

export function DevelopmentCard({ card, hidden, affordable = true, clickable, purchasable, highlighted, onClick }: DevelopmentCardProps) {
  if (hidden) {
    return <div className="dev-card" aria-label="Hidden reserved card" />
  }

  const classes = ['dev-card', `dev-card--bonus-${card.bonus}`]
  if (clickable) classes.push('dev-card--clickable')
  if (purchasable) classes.push('dev-card--purchasable')
  if (!affordable) classes.push('dev-card--unaffordable')
  if (highlighted) classes.push('dev-card--highlighted')

  return (
    <div className={classes.join(' ')} onClick={clickable ? onClick : undefined} role={clickable ? 'button' : undefined}>
      <div className="dev-card__top">
        <GemIcon color={card.bonus} size="large" />
        {card.points > 0 && <strong>{card.points}</strong>}
      </div>
      <div className="dev-card__cost">
        {(Object.entries(card.cost) as [TokenColor, number][]).map(([color, amount]) => (
          <GemIcon key={color} color={color} size="small" count={amount} />
        ))}
      </div>
    </div>
  )
}
