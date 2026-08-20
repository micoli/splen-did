import { useEffect, useMemo, useState } from 'react'
import { createSeededRng, createInitialState } from '../engine/setup'
import type { PlayerConfig } from '../engine/setup'
import { encodeGameLink } from '../engine/gameLink'
import { useAIPlayer } from '../hooks/useAIPlayer'
import { useBeforeUnloadWarning } from '../hooks/useBeforeUnloadWarning'
import { useGameEngine } from '../hooks/useGameEngine'
import { useLanguage } from '../i18n/LanguageContext'
import { Board } from './board/Board'

interface GameScreenProps {
  players: PlayerConfig[]
  initialSeed?: number
  onRematch: () => void
  onExit: () => void
}

interface RestartConfirming {
  phase: 'confirming'
  pendingIds: string[]
}

type RestartState = { phase: 'idle' } | RestartConfirming

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

export function GameScreen({ players, initialSeed, onRematch, onExit }: GameScreenProps) {
  const { t } = useLanguage()
  const isSolo = players.some((p) => p.isAI)
  const [seed, setSeed] = useState(() => initialSeed ?? randomSeed())
  const initialState = useMemo(() => createInitialState({ players, rng: createSeededRng(seed) }), [players, seed])
  const { state, dispatch, legalActions, currentPlayerId, lastError, lastPlayedAction, actionLog, resetState } =
    useGameEngine(initialState)
  useAIPlayer(state, dispatch)
  useBeforeUnloadWarning(!isSolo)

  useEffect(() => {
    window.location.hash = encodeGameLink(seed, players)
  }, [seed, players])

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
        const nextSeed = randomSeed()
        setSeed(nextSeed)
        resetState(createInitialState({ players, rng: createSeededRng(nextSeed) }))
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
      actionLog={actionLog}
      dispatch={dispatch}
      onRematch={onRematch}
      onExit={onExit}
      onProposeRestart={onProposeRestart}
      restartPrompt={pendingPlayer ? t.restartPrompt(pendingPlayer.name) : undefined}
      onRespondRestart={onRespondRestart}
    />
  )
}
