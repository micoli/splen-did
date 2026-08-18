import { computeEffectiveCost } from '../../engine/rules'
import type { CardDef, PlayerState } from '../../engine/types'

/** Lower is better: remaining token cost after bonuses, discounted a bit per prestige point. */
export function cardScore(card: CardDef, player: PlayerState): number {
  const effectiveCost = computeEffectiveCost(card, player.bonuses)
  const remainingCost = Object.values(effectiveCost).reduce((sum, amount) => sum + amount, 0)
  return remainingCost - card.points * 1.5
}

export function pickBestCard(cards: CardDef[], player: PlayerState): CardDef {
  return cards.reduce((best, card) => (cardScore(card, player) < cardScore(best, player) ? card : best))
}
