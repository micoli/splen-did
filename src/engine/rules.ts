import { TOKEN_COLORS } from './types'
import type { CardDef, GameState, NobleDef, PlayerState, Token, TokenColor } from './types'
import { currentPlayer, findPlayer, getCardDef, getNobleDef, playerPrestige, totalTokens, visibleCardIds } from './selectors'

export const MAX_RESERVED_CARDS = 3
export const MAX_TOKENS_IN_HAND = 10
export const MIN_BANK_FOR_TAKE_TWO = 4

export function computeEffectiveCost(card: CardDef, bonuses: Record<TokenColor, number>): Partial<Record<TokenColor, number>> {
  const cost: Partial<Record<TokenColor, number>> = {}
  for (const [color, amount] of Object.entries(card.cost) as [TokenColor, number][]) {
    const remaining = Math.max(0, amount - bonuses[color])
    if (remaining > 0) cost[color] = remaining
  }
  return cost
}

/** Greedy affordable payment: pay owned color tokens first, cover any shortfall with gold. Returns null if unaffordable even with gold. */
export function computeAffordablePayment(card: CardDef, player: PlayerState): Partial<Record<Token, number>> | null {
  const effectiveCost = computeEffectiveCost(card, player.bonuses)
  const payment: Partial<Record<Token, number>> = {}
  let goldNeeded = 0

  for (const [color, owed] of Object.entries(effectiveCost) as [TokenColor, number][]) {
    const paid = Math.min(owed, player.tokens[color])
    if (paid > 0) payment[color] = paid
    goldNeeded += owed - paid
  }

  if (goldNeeded > player.tokens.gold) return null
  if (goldNeeded > 0) payment.gold = goldNeeded
  return payment
}

export function validatePayment(card: CardDef, player: PlayerState, payment: Partial<Record<Token, number>>): string | null {
  const effectiveCost = computeEffectiveCost(card, player.bonuses)
  let goldNeeded = 0

  for (const color of TOKEN_COLORS) {
    const owed = effectiveCost[color] ?? 0
    const paid = payment[color] ?? 0
    if (paid > owed) return `Overpaid ${color}: owes ${owed}, paid ${paid}`
    if (paid > player.tokens[color]) return `Not enough ${color} tokens in hand`
    goldNeeded += owed - paid
  }

  const paidGold = payment.gold ?? 0
  if (paidGold !== goldNeeded) return `Payment must cover exactly ${goldNeeded} gold, got ${paidGold}`
  if (paidGold > player.tokens.gold) return `Not enough gold tokens in hand`

  return null
}

export function validateTakeThreeDifferent(state: GameState, colors: TokenColor[]): string | null {
  const availableColors = TOKEN_COLORS.filter((c) => state.bank[c] >= 1)
  const expectedCount = Math.min(3, availableColors.length)
  if (colors.length !== expectedCount) return `Must take ${expectedCount} token(s) when only ${availableColors.length} color(s) remain in bank`
  if (new Set(colors).size !== colors.length) return 'Colors must be different'
  for (const color of colors) {
    if (state.bank[color] < 1) return `No ${color} tokens left in bank`
  }
  return null
}

export function validateTakeTwoSame(state: GameState, color: TokenColor): string | null {
  if (state.bank[color] < MIN_BANK_FOR_TAKE_TWO) return `Bank needs at least ${MIN_BANK_FOR_TAKE_TWO} ${color} tokens to take 2`
  return null
}

export function validateReserve(state: GameState, player: PlayerState, cardId: string): string | null {
  if (player.reservedCardIds.length >= MAX_RESERVED_CARDS) return 'Already has 3 reserved cards'
  if (!visibleCardIds(state).includes(cardId) && !isTopOfAnyDeck(state, cardId)) {
    return 'Card is not visible or not on top of a deck'
  }
  return null
}

function isTopOfAnyDeck(state: GameState, cardId: string): boolean {
  return (
    state.decks[1].at(-1) === cardId || state.decks[2].at(-1) === cardId || state.decks[3].at(-1) === cardId
  )
}

export function validatePurchase(
  state: GameState,
  player: PlayerState,
  cardId: string,
  source: 'visible' | 'reserved',
  payment: Partial<Record<Token, number>>
): string | null {
  if (source === 'visible' && !visibleCardIds(state).includes(cardId)) return 'Card is not currently visible'
  if (source === 'reserved' && !player.reservedCardIds.includes(cardId)) return 'Card is not in your reserved cards'

  const card = getCardDef(cardId)
  return validatePayment(card, player, payment)
}

export function eligibleNobles(player: PlayerState, availableNobleIds: string[]): NobleDef[] {
  return availableNobleIds
    .map(getNobleDef)
    .filter((noble) =>
      (Object.entries(noble.requirement) as [TokenColor, number][]).every(([color, amount]) => player.bonuses[color] >= amount)
    )
}

export function needsDiscard(player: PlayerState): boolean {
  return totalTokens(player) > MAX_TOKENS_IN_HAND
}

export function checkRoundEndTrigger(state: GameState): GameState {
  if (state.roundEndTriggered) return state
  const player = currentPlayer(state)
  if (playerPrestige(player) < 15) return state
  return { ...state, roundEndTriggered: true, finalRoundStartPlayerIndex: state.currentPlayerIndex }
}

export function isFinalTurnOfRound(state: GameState): boolean {
  if (!state.roundEndTriggered || state.finalRoundStartPlayerIndex === null) return false
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
  return nextIndex === state.finalRoundStartPlayerIndex
}

export function resolveGameOver(state: GameState): GameState {
  let best: PlayerState | null = null
  for (const player of state.players) {
    if (!best) {
      best = player
      continue
    }
    const playerScore = playerPrestige(player)
    const bestScore = playerPrestige(best)
    if (playerScore > bestScore) {
      best = player
    } else if (playerScore === bestScore && player.ownedCardIds.length < best.ownedCardIds.length) {
      best = player
    }
  }
  return { ...state, gameOver: true, winnerId: best?.id ?? null }
}

export function advanceTurn(state: GameState): GameState {
  const finishingFinalTurn = isFinalTurnOfRound(state)
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
  const advanced: GameState = { ...state, currentPlayerIndex: nextIndex, turnPhase: 'action' }
  return finishingFinalTurn ? resolveGameOver(advanced) : advanced
}

export function requirePlayerTurn(state: GameState, playerId: string): string | null {
  if (findPlayer(state, playerId).id !== currentPlayer(state).id) return 'Not your turn'
  return null
}
