import { createInitialState } from '../setup'
import type { GameState } from '../types'

/** Deterministic LCG so tests are reproducible without depending on Math.random. */
export function seededRng(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

export function makeGame(playerCount: 2 | 3 | 4 = 2, seed = 1): GameState {
  return createInitialState({
    players: Array.from({ length: playerCount }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      isAI: false,
    })),
    rng: seededRng(seed),
  })
}
