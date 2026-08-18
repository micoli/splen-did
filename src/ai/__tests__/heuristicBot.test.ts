import { describe, expect, it } from 'vitest'
import { chooseAction } from '../heuristicBot'
import { gameReducer } from '../../engine/reducer'
import { createInitialState } from '../../engine/setup'
import { currentPlayer } from '../../engine/selectors'
import { seededRng } from '../../engine/__tests__/testHelpers'

describe('heuristic AI', () => {
  it('plays a full AI-vs-AI game to completion without illegal moves', () => {
    for (let seed = 1; seed <= 3; seed++) {
      let state = createInitialState({
        players: [
          { id: 'p1', name: 'Bot 1', isAI: true },
          { id: 'p2', name: 'Bot 2', isAI: true },
        ],
        rng: seededRng(seed * 101),
      })

      let turns = 0
      const maxTurns = 2000
      while (!state.gameOver && turns < maxTurns) {
        const player = currentPlayer(state)
        const action = chooseAction(state, player.id)
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
