import { enumerateLegalActions } from '../engine/legalActions'
import { computeEffectiveCost } from '../engine/rules'
import { findPlayer, getCardDef, visibleCardIds } from '../engine/selectors'
import { TOKEN_COLORS } from '../engine/types'
import type { Action, GameState, Token } from '../engine/types'
import { mostThreateningVisibleCardId, opponentsInDanger } from './heuristics/blocking'
import { pickHardestNoble } from './heuristics/nobleStrategy'
import { cardScore, pickBestCard } from './heuristics/scoreCard'

function pickDiscard(state: GameState, playerId: string, discardActions: Extract<Action, { type: 'DISCARD_TOKENS' }>[]): Action {
  const player = findPlayer(state, playerId)
  const withoutGold = discardActions.filter((a) => !a.tokens.gold)
  const candidates = withoutGold.length > 0 ? withoutGold : discardActions

  return candidates.reduce((best, action) => (surplusScore(action, player.tokens) > surplusScore(best, player.tokens) ? action : best))
}

function surplusScore(action: Extract<Action, { type: 'DISCARD_TOKENS' }>, tokens: Record<Token, number>): number {
  return (Object.entries(action.tokens) as [Token, number][]).reduce((sum, [color, amount]) => sum + tokens[color] * (amount ?? 0), 0)
}

export function chooseAction(state: GameState, playerId: string): Action {
  const legalActions = enumerateLegalActions(state, playerId)
  if (legalActions.length === 0) throw new Error('No legal actions available for AI player')

  if (state.turnPhase === 'discard') {
    const discardActions = legalActions.filter(
      (a): a is Extract<Action, { type: 'DISCARD_TOKENS' }> => a.type === 'DISCARD_TOKENS'
    )
    return pickDiscard(state, playerId, discardActions)
  }

  if (state.turnPhase === 'nobleClaim') {
    const claimActions = legalActions.filter((a): a is Extract<Action, { type: 'CLAIM_NOBLE' }> => a.type === 'CLAIM_NOBLE')
    const best = pickHardestNoble(claimActions.map((a) => a.nobleId))
    return claimActions.find((a) => a.nobleId === best.id)!
  }

  const player = findPlayer(state, playerId)

  const purchaseActions = legalActions.filter((a): a is Extract<Action, { type: 'PURCHASE_CARD' }> => a.type === 'PURCHASE_CARD')
  if (purchaseActions.length > 0) {
    const best = purchaseActions.reduce((bestAction, action) =>
      cardScore(getCardDef(action.cardId), player) < cardScore(getCardDef(bestAction.cardId), player) ? action : bestAction
    )
    return best
  }

  const reserveActions = legalActions.filter((a): a is Extract<Action, { type: 'RESERVE_CARD' }> => a.type === 'RESERVE_CARD')
  const dangerousOpponents = opponentsInDanger(state, playerId)
  if (dangerousOpponents.length > 0 && reserveActions.length > 0) {
    const threateningCardId = mostThreateningVisibleCardId(visibleCardIds(state), dangerousOpponents)
    const denyAction = reserveActions.find((a) => a.cardId === threateningCardId)
    if (denyAction) return denyAction
  }

  const take3Actions = legalActions.filter(
    (a): a is Extract<Action, { type: 'TAKE_THREE_DIFFERENT' }> => a.type === 'TAKE_THREE_DIFFERENT'
  )
  const take2Actions = legalActions.filter((a): a is Extract<Action, { type: 'TAKE_TWO_SAME' }> => a.type === 'TAKE_TWO_SAME')

  const visible = visibleCardIds(state).map(getCardDef)
  if (visible.length > 0 && (take3Actions.length > 0 || take2Actions.length > 0)) {
    const target = pickBestCard(visible, player)
    const effectiveCost = computeEffectiveCost(target, player.bonuses)
    const shortfallColors = new Set(
      TOKEN_COLORS.filter((color) => (effectiveCost[color] ?? 0) > player.tokens[color])
    )

    if (take3Actions.length > 0) {
      const best = take3Actions.reduce((bestAction, action) => {
        const score = action.colors.filter((c) => shortfallColors.has(c)).length
        const bestScore = bestAction.colors.filter((c) => shortfallColors.has(c)).length
        return score > bestScore ? action : bestAction
      })
      return best
    }

    const usefulTake2 = take2Actions.find((a) => shortfallColors.has(a.color))
    if (usefulTake2) return usefulTake2
  }

  if (reserveActions.length > 0 && purchaseActions.length === 0 && take3Actions.length === 0 && take2Actions.length === 0) {
    return reserveActions[0]
  }

  return legalActions[Math.floor(Math.random() * legalActions.length)]
}
