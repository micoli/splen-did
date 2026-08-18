import { useCallback, useMemo, useState } from 'react'
import { enumerateLegalActions } from '../engine/legalActions'
import { gameReducer } from '../engine/reducer'
import { currentPlayer } from '../engine/selectors'
import type { Action, GameState } from '../engine/types'

export function useGameEngine(initialState: GameState) {
  const [state, setState] = useState(initialState)
  const [lastError, setLastError] = useState<string | null>(null)

  const player = currentPlayer(state)

  const legalActions = useMemo(() => enumerateLegalActions(state, player.id), [state, player.id])

  const dispatch = useCallback(
    (action: Action) => {
      const { state: next, error } = gameReducer(state, action, player.id)
      if (error) {
        setLastError(error)
        return
      }
      setLastError(null)
      setState(next)
    },
    [state, player.id]
  )

  return { state, dispatch, legalActions, currentPlayerId: player.id, lastError }
}
