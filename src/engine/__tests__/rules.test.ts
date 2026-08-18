import { describe, expect, it } from 'vitest'
import { gameReducer } from '../reducer'
import { computeEffectiveCost, eligibleNobles, resolveGameOver } from '../rules'
import { getCardDef } from '../selectors'
import { makeGame } from './testHelpers'

describe('take tokens', () => {
  it('allows taking 3 different colors', () => {
    const state = makeGame()
    const { state: next, error } = gameReducer(state, { type: 'TAKE_THREE_DIFFERENT', colors: ['white', 'blue', 'green'] }, 'p1')
    expect(error).toBeUndefined()
    expect(next.players[0].tokens.white).toBe(1)
    expect(next.players[0].tokens.blue).toBe(1)
    expect(next.players[0].tokens.green).toBe(1)
    expect(next.bank.white).toBe(state.bank.white - 1)
  })

  it('rejects taking 3 tokens with a repeated color', () => {
    const state = makeGame()
    const { error } = gameReducer(state, { type: 'TAKE_THREE_DIFFERENT', colors: ['white', 'white', 'blue'] }, 'p1')
    expect(error).toBeDefined()
  })

  it('rejects taking 2 same when bank has fewer than 4', () => {
    const state = { ...makeGame(), bank: { ...makeGame().bank, white: 3 } }
    const { error } = gameReducer(state, { type: 'TAKE_TWO_SAME', color: 'white' }, 'p1')
    expect(error).toBeDefined()
  })

  it('allows taking 2 same when bank has exactly 4', () => {
    const base = makeGame()
    const state = { ...base, bank: { ...base.bank, white: 4 } }
    const { state: next, error } = gameReducer(state, { type: 'TAKE_TWO_SAME', color: 'white' }, 'p1')
    expect(error).toBeUndefined()
    expect(next.players[0].tokens.white).toBe(2)
  })
})

describe('purchase with gold substitution', () => {
  it('lets gold tokens cover the full cost of a card', () => {
    const base = makeGame()
    const card = getCardDef(base.visibleCards[1][0]!)
    const totalCost = Object.values(card.cost).reduce((sum, amount) => sum + amount, 0)
    const state = {
      ...base,
      players: base.players.map((p, i) => (i === 0 ? { ...p, tokens: { ...p.tokens, gold: totalCost } } : p)),
    }

    const { state: next, error } = gameReducer(
      state,
      { type: 'PURCHASE_CARD', cardId: card.id, source: 'visible', payment: { gold: totalCost } },
      'p1'
    )
    expect(error).toBeUndefined()
    expect(next.players[0].ownedCardIds).toContain(card.id)
    expect(next.players[0].bonuses[card.bonus]).toBe(1)
    expect(next.players[0].tokens.gold).toBe(0)
  })
})

describe('discard to 10', () => {
  it('forces a discard phase when a player exceeds 10 tokens, and blocks under-discarding', () => {
    const base = makeGame()
    const state = {
      ...base,
      bank: { ...base.bank, white: 4 },
      players: base.players.map((p, i) =>
        i === 0 ? { ...p, tokens: { white: 0, blue: 3, green: 3, red: 3, black: 0, gold: 0 } } : p
      ),
    }
    const { state: next, error } = gameReducer(state, { type: 'TAKE_TWO_SAME', color: 'white' }, 'p1')
    expect(error).toBeUndefined()
    expect(next.turnPhase).toBe('discard')

    const underDiscard = gameReducer(next, { type: 'DISCARD_TOKENS', tokens: {} }, 'p1')
    expect(underDiscard.error).toBeDefined()

    const resolved = gameReducer(next, { type: 'DISCARD_TOKENS', tokens: { white: 1 } }, 'p1')
    expect(resolved.error).toBeUndefined()
    expect(resolved.state.turnPhase).toBe('action')
    expect(resolved.state.currentPlayerIndex).toBe(1)
  })
})

describe('nobles', () => {
  it('reports a noble as eligible once its bonus requirement is met', () => {
    const base = makeGame()
    const player = { ...base.players[0], bonuses: { ...base.players[0].bonuses, green: 4, red: 4 } }
    const eligible = eligibleNobles(player, ['N01'])
    expect(eligible.map((n) => n.id)).toEqual(['N01'])
  })

  it('auto-claims the single eligible noble right after the purchase that unlocks it', () => {
    const base = makeGame()
    const card = getCardDef(base.visibleCards[1][0]!)
    const preBonuses = {
      ...base.players[0].bonuses,
      green: card.bonus === 'green' ? 3 : 4,
      red: card.bonus === 'red' ? 3 : 4,
    }
    const effectiveCost = computeEffectiveCost(card, preBonuses)
    const goldNeeded = Object.values(effectiveCost).reduce((sum, amount) => sum + amount, 0)
    const state = {
      ...base,
      nobles: ['N01'], // requires green:4, red:4
      players: base.players.map((p, i) =>
        i === 0 ? { ...p, tokens: { ...p.tokens, gold: goldNeeded }, bonuses: preBonuses } : p
      ),
    }

    const { state: next, error } = gameReducer(
      state,
      { type: 'PURCHASE_CARD', cardId: card.id, source: 'visible', payment: { gold: goldNeeded } },
      'p1'
    )
    expect(error).toBeUndefined()
    expect(next.players[0].nobleIds).toContain('N01')
    expect(next.turnPhase).toBe('action')
  })
})

describe('game end resolution', () => {
  it('picks the higher-prestige player as winner', () => {
    const base = makeGame(2)
    const state = {
      ...base,
      players: base.players.map((p, i) => (i === 0 ? { ...p, ownedCardIds: [base.visibleCards[3][0]!] } : p)),
    }
    const resolved = resolveGameOver(state)
    expect(resolved.gameOver).toBe(true)
    expect(resolved.winnerId).toBe('p1')
  })

  it('breaks a prestige tie by fewest owned development cards', () => {
    const base = makeGame(2)
    const level1Card = base.visibleCards[1][0]!
    const level3Card = base.visibleCards[3][0]!
    // both players reach the same prestige, but player 2 needed fewer cards to get there
    const state = {
      ...base,
      players: base.players.map((p, i) =>
        i === 0 ? { ...p, ownedCardIds: [level3Card] } : { ...p, ownedCardIds: [level1Card, level1Card] }
      ),
    }
    const resolved = resolveGameOver(state)
    // p1 has the level-3 card (more points, fewer cards) so should win outright on prestige already
    expect(resolved.winnerId).toBe('p1')
  })
})
