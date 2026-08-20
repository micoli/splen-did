import { getCardDef } from './selectors'
import {
  advanceTurn,
  checkRoundEndTrigger,
  eligibleNobles,
  needsDiscard,
  requirePlayerTurn,
  validatePayment,
  validateReserve,
  validateTakeThreeDifferent,
  validateTakeTwoSame,
} from './rules'
import { TOKEN_COLORS } from './types'
import type { Action, CardLevel, GameState, PlayerState, Token, TokenColor } from './types'

export interface ReducerResult {
  state: GameState
  error?: string
  autoClaimedNobleId?: string
}

function ok(result: GameState | TurnPhaseResult): ReducerResult {
  if ('state' in result) return { state: result.state, autoClaimedNobleId: result.autoClaimedNobleId }
  return { state: result }
}

function fail(state: GameState, error: string): ReducerResult {
  return { state, error }
}

function updatePlayer(state: GameState, playerId: string, update: (player: PlayerState) => PlayerState): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? update(p) : p)),
  }
}

function drawReplacement(state: GameState, level: CardLevel, slotIndex: number): GameState {
  const deck = [...state.decks[level]]
  const drawn = deck.pop() ?? null
  const visible = [...state.visibleCards[level]]
  visible[slotIndex] = drawn
  return {
    ...state,
    decks: { ...state.decks, [level]: deck },
    visibleCards: { ...state.visibleCards, [level]: visible },
  }
}

function removeFromVisible(state: GameState, cardId: string): GameState {
  for (const level of [1, 2, 3] as CardLevel[]) {
    const slotIndex = state.visibleCards[level].indexOf(cardId)
    if (slotIndex !== -1) return drawReplacement(state, level, slotIndex)
  }
  return state
}

function removeFromDeckTop(state: GameState, cardId: string): GameState {
  for (const level of [1, 2, 3] as CardLevel[]) {
    if (state.decks[level].at(-1) === cardId) {
      return { ...state, decks: { ...state.decks, [level]: state.decks[level].slice(0, -1) } }
    }
  }
  return state
}

interface TurnPhaseResult {
  state: GameState
  autoClaimedNobleId?: string
}

/** Resolves end-of-action phase transitions. `grantedBonus` marks purchase actions, which can trigger nobles but never discard. */
function resolveTurnPhase(state: GameState, playerId: string, grantedBonus: boolean): TurnPhaseResult {
  let next = checkRoundEndTrigger(state)

  if (grantedBonus) {
    const player = next.players.find((p) => p.id === playerId)!
    const eligible = eligibleNobles(player, next.nobles)
    if (eligible.length === 1) {
      next = applyClaimNoble(next, playerId, eligible[0].id)
      next = checkRoundEndTrigger(next)
      return { state: advanceTurn(next), autoClaimedNobleId: eligible[0].id }
    }
    if (eligible.length > 1) {
      return { state: { ...next, turnPhase: 'nobleClaim' } }
    }
    return { state: advanceTurn(next) }
  }

  const player = next.players.find((p) => p.id === playerId)!
  if (needsDiscard(player)) {
    return { state: { ...next, turnPhase: 'discard' } }
  }
  return { state: advanceTurn(next) }
}

function applyClaimNoble(state: GameState, playerId: string, nobleId: string): GameState {
  const withNoble = updatePlayer(state, playerId, (p) => ({ ...p, nobleIds: [...p.nobleIds, nobleId] }))
  return { ...withNoble, nobles: withNoble.nobles.filter((id) => id !== nobleId) }
}

export function gameReducer(state: GameState, action: Action, actingPlayerId: string): ReducerResult {
  const turnError = requirePlayerTurn(state, actingPlayerId)
  if (turnError) return fail(state, turnError)

  switch (action.type) {
    case 'TAKE_THREE_DIFFERENT': {
      if (state.turnPhase !== 'action') return fail(state, 'Not in action phase')
      const error = validateTakeThreeDifferent(state, action.colors)
      if (error) return fail(state, error)

      let next = { ...state, bank: { ...state.bank } }
      for (const color of action.colors) next.bank[color] -= 1
      next = updatePlayer(next, actingPlayerId, (p) => {
        const tokens = { ...p.tokens }
        for (const color of action.colors) tokens[color] += 1
        return { ...p, tokens }
      })
      return ok(resolveTurnPhase(next, actingPlayerId, false))
    }

    case 'TAKE_TWO_SAME': {
      if (state.turnPhase !== 'action') return fail(state, 'Not in action phase')
      const error = validateTakeTwoSame(state, action.color)
      if (error) return fail(state, error)

      let next = { ...state, bank: { ...state.bank, [action.color]: state.bank[action.color] - 2 } }
      next = updatePlayer(next, actingPlayerId, (p) => ({
        ...p,
        tokens: { ...p.tokens, [action.color]: p.tokens[action.color] + 2 },
      }))
      return ok(resolveTurnPhase(next, actingPlayerId, false))
    }

    case 'RESERVE_CARD': {
      if (state.turnPhase !== 'action') return fail(state, 'Not in action phase')
      const player = state.players.find((p) => p.id === actingPlayerId)!
      const error = validateReserve(state, player, action.cardId)
      if (error) return fail(state, error)

      const wasVisible = [...state.visibleCards[1], ...state.visibleCards[2], ...state.visibleCards[3]].includes(
        action.cardId
      )
      let next = wasVisible ? removeFromVisible(state, action.cardId) : removeFromDeckTop(state, action.cardId)

      const grantGold = next.bank.gold > 0
      if (grantGold) next = { ...next, bank: { ...next.bank, gold: next.bank.gold - 1 } }
      next = updatePlayer(next, actingPlayerId, (p) => ({
        ...p,
        reservedCardIds: [...p.reservedCardIds, action.cardId],
        tokens: grantGold ? { ...p.tokens, gold: p.tokens.gold + 1 } : p.tokens,
      }))
      return ok(resolveTurnPhase(next, actingPlayerId, false))
    }

    case 'PURCHASE_CARD': {
      if (state.turnPhase !== 'action') return fail(state, 'Not in action phase')
      const player = state.players.find((p) => p.id === actingPlayerId)!
      const card = getCardDef(action.cardId)

      if (action.source === 'visible') {
        const isVisible = [...state.visibleCards[1], ...state.visibleCards[2], ...state.visibleCards[3]].includes(
          action.cardId
        )
        if (!isVisible) return fail(state, 'Card is not currently visible')
      } else if (!player.reservedCardIds.includes(action.cardId)) {
        return fail(state, 'Card is not in your reserved cards')
      }

      const paymentError = validatePayment(card, player, action.payment)
      if (paymentError) return fail(state, paymentError)

      let next = action.source === 'visible' ? removeFromVisible(state, action.cardId) : state
      next = { ...next, bank: { ...next.bank } }
      for (const [token, amount] of Object.entries(action.payment) as [Token, number][]) {
        if (!amount) continue
        next.bank[token] += amount
      }

      next = updatePlayer(next, actingPlayerId, (p) => {
        const tokens = { ...p.tokens }
        for (const [token, amount] of Object.entries(action.payment) as [Token, number][]) {
          if (!amount) continue
          tokens[token] -= amount
        }
        return {
          ...p,
          tokens,
          ownedCardIds: [...p.ownedCardIds, action.cardId],
          bonuses: { ...p.bonuses, [card.bonus]: p.bonuses[card.bonus] + 1 },
          reservedCardIds: p.reservedCardIds.filter((id) => id !== action.cardId),
        }
      })

      return ok(resolveTurnPhase(next, actingPlayerId, true))
    }

    case 'DISCARD_TOKENS': {
      if (state.turnPhase !== 'discard') return fail(state, 'Not in discard phase')
      const player = state.players.find((p) => p.id === actingPlayerId)!
      let discardCount = 0
      for (const [token, amount] of Object.entries(action.tokens) as [Token, number][]) {
        if (!amount) continue
        if (amount > player.tokens[token]) return fail(state, `Cannot discard more ${token} than held`)
        discardCount += amount
      }
      const targetTotal = TOKEN_COLORS.reduce((sum, c) => sum + player.tokens[c], player.tokens.gold) - discardCount
      if (targetTotal > 10) return fail(state, 'Must discard down to 10 tokens')

      let next = { ...state, bank: { ...state.bank } }
      for (const [token, amount] of Object.entries(action.tokens) as [Token, number][]) {
        if (!amount) continue
        next.bank[token] += amount
      }
      next = updatePlayer(next, actingPlayerId, (p) => {
        const tokens = { ...p.tokens }
        for (const [token, amount] of Object.entries(action.tokens) as [Token, number][]) {
          if (!amount) continue
          tokens[token] -= amount
        }
        return { ...p, tokens }
      })
      return ok(advanceTurn(checkRoundEndTrigger(next)))
    }

    case 'CLAIM_NOBLE': {
      if (state.turnPhase !== 'nobleClaim') return fail(state, 'Not in noble claim phase')
      const player = state.players.find((p) => p.id === actingPlayerId)!
      const eligible = eligibleNobles(player, state.nobles)
      if (!eligible.some((n) => n.id === action.nobleId)) return fail(state, 'Not eligible for this noble')

      const next = applyClaimNoble(state, actingPlayerId, action.nobleId)
      return ok(advanceTurn(checkRoundEndTrigger(next)))
    }

    default: {
      const exhaustive: never = action
      return fail(state, `Unknown action: ${JSON.stringify(exhaustive)}`)
    }
  }
}

// exported for reuse by AI / legalActions without re-deriving the visible color list
export const ALL_TOKEN_COLORS: readonly TokenColor[] = TOKEN_COLORS
