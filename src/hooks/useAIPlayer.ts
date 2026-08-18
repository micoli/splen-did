import { useEffect } from 'react'
import { chooseAction } from '../ai/heuristicBot'
import { currentPlayer } from '../engine/selectors'
import type { Action, GameState } from '../engine/types'

const AI_MOVE_DELAY_MS = 600

export function useAIPlayer(state: GameState, dispatch: (action: Action) => void) {
  useEffect(() => {
    const player = currentPlayer(state)
    if (!player.isAI || state.gameOver) return

    const timer = setTimeout(() => {
      dispatch(chooseAction(state, player.id))
    }, AI_MOVE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [state, dispatch])
}
