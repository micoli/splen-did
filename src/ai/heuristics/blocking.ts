import { getCardDef, playerPrestige } from '../../engine/selectors'
import type { GameState, PlayerState } from '../../engine/types'
import { cardScore } from './scoreCard'

const PRESTIGE_DANGER_THRESHOLD = 12

export function opponentsInDanger(state: GameState, selfId: string): PlayerState[] {
  return state.players.filter((p) => p.id !== selfId && playerPrestige(p) >= PRESTIGE_DANGER_THRESHOLD)
}

/** Among visible cards, the one most valuable to any opponent in danger (lowest score = best for them). */
export function mostThreateningVisibleCardId(visibleCardIds: string[], dangerousOpponents: PlayerState[]): string | null {
  if (dangerousOpponents.length === 0 || visibleCardIds.length === 0) return null

  let bestCardId: string | null = null
  let bestScore = Infinity

  for (const cardId of visibleCardIds) {
    const card = getCardDef(cardId)
    for (const opponent of dangerousOpponents) {
      const score = cardScore(card, opponent)
      if (score < bestScore) {
        bestScore = score
        bestCardId = cardId
      }
    }
  }

  return bestCardId
}
