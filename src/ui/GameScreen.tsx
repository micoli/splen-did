import { useMemo } from 'react'
import { createInitialState } from '../engine/setup'
import type { PlayerConfig } from '../engine/setup'
import { useAIPlayer } from '../hooks/useAIPlayer'
import { useGameEngine } from '../hooks/useGameEngine'
import { Board } from './board/Board'

interface GameScreenProps {
  players: PlayerConfig[]
  onRematch: () => void
}

export function GameScreen({ players, onRematch }: GameScreenProps) {
  const initialState = useMemo(() => createInitialState({ players }), [players])
  const { state, dispatch, legalActions, currentPlayerId, lastError } = useGameEngine(initialState)
  useAIPlayer(state, dispatch)

  return (
    <Board
      state={state}
      legalActions={legalActions}
      currentPlayerId={currentPlayerId}
      lastError={lastError}
      dispatch={dispatch}
      onRematch={onRematch}
    />
  )
}
