import { useCallback, useMemo, useState } from 'react'
import { enumerateLegalActions } from '../engine/legalActions'
import { gameReducer } from '../engine/reducer'
import { currentPlayer } from '../engine/selectors'
import type { Action, CardLevel, GameState } from '../engine/types'

export interface PlayedAction {
  action: Action
  playerId: string
  purchasedSlot?: { level: CardLevel; index: number }
}

function findPurchasedSlot(prev: GameState, action: Action): { level: CardLevel; index: number } | undefined {
  if (action.type !== 'PURCHASE_CARD' || action.source !== 'visible') return undefined
  for (const level of [1, 2, 3] as CardLevel[]) {
    const index = prev.visibleCards[level].indexOf(action.cardId)
    if (index !== -1) return { level, index }
  }
  return undefined
}

export function useGameEngine(initialState: GameState) {
  const [state, setState] = useState(initialState)
  const [lastError, setLastError] = useState<string | null>(null)
  const [lastPlayedAction, setLastPlayedAction] = useState<PlayedAction | null>(null)
  const [actionLog, setActionLog] = useState<PlayedAction[]>([])

  const player = currentPlayer(state)

  const legalActions = useMemo(() => enumerateLegalActions(state, player.id), [state, player.id])

  const dispatch = useCallback(
    (action: Action) => {
      const { state: next, error, autoClaimedNobleId } = gameReducer(state, action, player.id)
      if (error) {
        setLastError(error)
        return
      }
      setLastError(null)
      const played = { action, playerId: player.id, purchasedSlot: findPurchasedSlot(state, action) }
      const entries = autoClaimedNobleId
        ? [played, { action: { type: 'CLAIM_NOBLE', nobleId: autoClaimedNobleId } as Action, playerId: player.id }]
        : [played]
      setLastPlayedAction(played)
      setActionLog((prev) => [...prev, ...entries])
      setState(next)
    },
    [state, player.id]
  )

  const resetState = useCallback((next: GameState) => {
    setState(next)
    setLastError(null)
    setLastPlayedAction(null)
    setActionLog([])
  }, [])

  return { state, dispatch, legalActions, currentPlayerId: player.id, lastError, lastPlayedAction, actionLog, resetState }
}
