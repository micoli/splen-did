import { useMemo, useState } from 'react'
import { createInitialState } from '../engine/setup'
import type { PlayerConfig } from '../engine/setup'
import { useAIPlayer } from '../hooks/useAIPlayer'
import { useBeforeUnloadWarning } from '../hooks/useBeforeUnloadWarning'
import { useGameEngine } from '../hooks/useGameEngine'
import { Board } from './board/Board'

interface GameScreenProps {
  players: PlayerConfig[]
  onRematch: () => void
  onExit: () => void
}

interface RestartConfirming {
  phase: 'confirming'
  pendingIds: string[]
}

type RestartState = { phase: 'idle' } | RestartConfirming

export function GameScreen({ players, onRematch, onExit }: GameScreenProps) {
  const initialState = useMemo(() => createInitialState({ players }), [players])
  const { state, dispatch, legalActions, currentPlayerId, lastError, lastPlayedAction, resetState } = useGameEngine(initialState)
  useAIPlayer(state, dispatch)
  useBeforeUnloadWarning()

  const [restart, setRestart] = useState<RestartState>({ phase: 'idle' })

  function onProposeRestart() {
    const pendingIds = players.filter((p) => !p.isAI).map((p) => p.id)
    setRestart({ phase: 'confirming', pendingIds })
  }

  function onRespondRestart(accept: boolean) {
    if (!accept) {
      setRestart({ phase: 'idle' })
      return
    }
    setRestart((prev) => {
      if (prev.phase !== 'confirming') return prev
      const [, ...rest] = prev.pendingIds
      if (rest.length === 0) {
        resetState(createInitialState({ players }))
        return { phase: 'idle' }
      }
      return { phase: 'confirming', pendingIds: rest }
    })
  }

  const pendingPlayer =
    restart.phase === 'confirming' ? players.find((p) => p.id === restart.pendingIds[0]) : undefined

  return (
    <Board
      state={state}
      legalActions={legalActions}
      currentPlayerId={currentPlayerId}
      lastError={lastError}
      lastPlayedAction={lastPlayedAction}
      dispatch={dispatch}
      onRematch={onRematch}
      onExit={onExit}
      onProposeRestart={onProposeRestart}
      restartPrompt={pendingPlayer ? `${pendingPlayer.name}, acceptez-vous de redemarrer la partie ?` : undefined}
      onRespondRestart={onRespondRestart}
    />
  )
}
