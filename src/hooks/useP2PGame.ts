import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { enumerateLegalActions } from '../engine/legalActions'
import { currentPlayer } from '../engine/selectors'
import type { Action, GameState } from '../engine/types'
import { createGuestSession } from '../net/guestSession'
import type { GuestSession } from '../net/guestSession'
import { createHostSession } from '../net/hostSession'
import type { HostSession } from '../net/hostSession'
import type { PeerHandle } from '../net/webrtc'
import type { RestartEvent } from '../net/protocol'

type RestartPhase = 'idle' | 'awaitingPeer' | 'peerRequested'

interface UseP2PGameOptions {
  role: 'host' | 'guest'
  handle: PeerHandle
  localPlayerId: string
  /** Host only: the authoritative starting state, already includes both players. */
  initialState?: GameState
}

export function useP2PGame({ role, handle, localPlayerId, initialState }: UseP2PGameOptions) {
  const [state, setState] = useState<GameState | null>(initialState ?? null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [restartPhase, setRestartPhase] = useState<RestartPhase>('idle')
  const sessionRef = useRef<HostSession | GuestSession | null>(null)

  useEffect(() => {
    function onRestartEvent(event: RestartEvent) {
      if (event.type === 'requested') setRestartPhase('peerRequested')
      else setRestartPhase('idle')
    }

    if (role === 'host') {
      if (!initialState) throw new Error('Host requires an initial state')
      const guestPlayerId = initialState.players.find((p) => p.id !== localPlayerId)!.id
      sessionRef.current = createHostSession(
        handle,
        initialState,
        initialState.players,
        guestPlayerId,
        setState,
        onRestartEvent
      )
    } else {
      sessionRef.current = createGuestSession(handle, setState, setLastError, onRestartEvent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dispatch = useCallback(
    (action: Action) => {
      const session = sessionRef.current
      if (!session) return
      if (role === 'host') (session as HostSession).submitAction(action, localPlayerId)
      else (session as GuestSession).submitIntent(action)
    },
    [role, localPlayerId]
  )

  const rematch = useCallback(() => {
    sessionRef.current?.rematch()
  }, [])

  const proposeRestart = useCallback(() => {
    sessionRef.current?.proposeRestart()
    setRestartPhase('awaitingPeer')
  }, [])

  const respondRestart = useCallback((accept: boolean) => {
    sessionRef.current?.respondRestart(accept)
    setRestartPhase('idle')
  }, [])

  const legalActions = useMemo(() => (state ? enumerateLegalActions(state, localPlayerId) : []), [state, localPlayerId])

  return {
    state,
    dispatch,
    legalActions,
    currentPlayerId: state ? currentPlayer(state).id : localPlayerId,
    lastError,
    rematch,
    restartPhase,
    proposeRestart,
    respondRestart,
  }
}
