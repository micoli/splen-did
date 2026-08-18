import { GemIcon } from '../shared/GemIcon'
import type { CardDef, TokenColor } from '../../engine/types'

interface DevelopmentCardProps {
  card: CardDef
  hidden?: boolean
  affordable?: boolean
  clickable?: boolean
  onClick?: () => void
}

export function DevelopmentCard({ card, hidden, affordable = true, clickable, onClick }: DevelopmentCardProps) {
  if (hidden) {
    return <div className="dev-card" aria-label="Hidden reserved card" />
  }

  const classes = ['dev-card']
  if (clickable) classes.push('dev-card--clickable')
  if (!affordable) classes.push('dev-card--unaffordable')

  return (
    <div className={classes.join(' ')} onClick={clickable ? onClick : undefined} role={clickable ? 'button' : undefined}>
      <div className="dev-card__top">
        <GemIcon color={card.bonus} size="medium" />
        {card.points > 0 && <strong>{card.points}</strong>}
      </div>
      <div className="dev-card__cost">
        {(Object.entries(card.cost) as [TokenColor, number][]).map(([color, amount]) => (
          <div key={color} className="dev-card__cost-row">
            <GemIcon color={color} size="small" />
            <span>{amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
