import { describe, expect, it } from 'vitest'
import { enumerateLegalActions } from '../legalActions'
import { gameReducer } from '../reducer'
import { currentPlayer } from '../selectors'
import { makeGame, seededRng } from './testHelpers'

function pickRandom<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]
}

describe('random playthrough', () => {
  it('a full random game always terminates with a winner, never gets stuck', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const rng = seededRng(seed * 7919)
      let state = makeGame(2, seed)
      let turns = 0
      const maxTurns = 2000

      while (!state.gameOver && turns < maxTurns) {
        const player = currentPlayer(state)
        const legal = enumerateLegalActions(state, player.id)
        expect(legal.length).toBeGreaterThan(0)

        const action = pickRandom(legal, rng)
        const { state: next, error } = gameReducer(state, action, player.id)
        expect(error).toBeUndefined()
        state = next
        turns++
      }

      expect(state.gameOver).toBe(true)
      expect(state.winnerId).not.toBeNull()
    }
  })
})
