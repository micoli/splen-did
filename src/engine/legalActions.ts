import { getCardDef, visibleCardIds } from './selectors'
import { computeAffordablePayment, eligibleNobles, MAX_RESERVED_CARDS, MIN_BANK_FOR_TAKE_TWO } from './rules'
import { TOKEN_COLORS } from './types'
import type { Action, CardLevel, GameState, PlayerState, Token, TokenColor } from './types'

function combinations3(colors: readonly TokenColor[]): [TokenColor, TokenColor, TokenColor][] {
  const result: [TokenColor, TokenColor, TokenColor][] = []
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      for (let k = j + 1; k < colors.length; k++) {
        result.push([colors[i], colors[j], colors[k]])
      }
    }
  }
  return result
}

function discardCombinations(player: PlayerState, excess: number): Partial<Record<Token, number>>[] {
  const tokenEntries = ([...TOKEN_COLORS, 'gold'] as Token[])
    .map((token) => [token, player.tokens[token]] as const)
    .filter(([, count]) => count > 0)

  const results: Partial<Record<Token, number>>[] = []

  function backtrack(index: number, remaining: number, current: Partial<Record<Token, number>>) {
    if (remaining === 0) {
      results.push({ ...current })
      return
    }
    if (index >= tokenEntries.length) return
    const [token, available] = tokenEntries[index]
    const maxTake = Math.min(available, remaining)
    for (let take = maxTake; take >= 0; take--) {
      if (take > 0) current[token] = take
      else delete current[token]
      backtrack(index + 1, remaining - take, current)
    }
    delete current[token]
  }

  backtrack(0, excess, {})
  return results
}

export function enumerateLegalActions(state: GameState, playerId: string): Action[] {
  const player = state.players.find((p) => p.id === playerId)
  if (!player) return []
  if (state.players[state.currentPlayerIndex].id !== playerId) return []

  if (state.turnPhase === 'discard') {
    const total = TOKEN_COLORS.reduce((sum, c) => sum + player.tokens[c], player.tokens.gold)
    const excess = total - 10
    if (excess <= 0) return []
    return discardCombinations(player, excess).map((tokens) => ({ type: 'DISCARD_TOKENS', tokens }))
  }

  if (state.turnPhase === 'nobleClaim') {
    return eligibleNobles(player, state.nobles).map((noble) => ({ type: 'CLAIM_NOBLE', nobleId: noble.id }))
  }

  const actions: Action[] = []

  const availableColors = TOKEN_COLORS.filter((c) => state.bank[c] >= 1)
  if (availableColors.length >= 3) {
    for (const colors of combinations3(availableColors)) {
      actions.push({ type: 'TAKE_THREE_DIFFERENT', colors })
    }
  } else if (availableColors.length > 0) {
    // fewer than 3 colors left in bank: take one of each remaining color (official rules exception)
    actions.push({ type: 'TAKE_THREE_DIFFERENT', colors: availableColors })
  }

  for (const color of TOKEN_COLORS) {
    if (state.bank[color] >= MIN_BANK_FOR_TAKE_TWO) {
      actions.push({ type: 'TAKE_TWO_SAME', color })
    }
  }

  if (player.reservedCardIds.length < MAX_RESERVED_CARDS) {
    for (const cardId of visibleCardIds(state)) {
      actions.push({ type: 'RESERVE_CARD', cardId })
    }
    for (const level of [1, 2, 3] as CardLevel[]) {
      const topId = state.decks[level].at(-1)
      if (topId) actions.push({ type: 'RESERVE_CARD', cardId: topId, fromLevel: level })
    }
  }

  for (const cardId of visibleCardIds(state)) {
    const payment = computeAffordablePayment(getCardDef(cardId), player)
    if (payment) actions.push({ type: 'PURCHASE_CARD', cardId, source: 'visible', payment })
  }
  for (const cardId of player.reservedCardIds) {
    const payment = computeAffordablePayment(getCardDef(cardId), player)
    if (payment) actions.push({ type: 'PURCHASE_CARD', cardId, source: 'reserved', payment })
  }

  return actions
}
