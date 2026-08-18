import { useEffect } from 'react'
import { createInitialState } from '../engine/setup'
import { useP2PGame } from '../hooks/useP2PGame'
import type { PeerHandle } from '../net/webrtc'
import { Board } from './board/Board'

export const HOST_PLAYER_ID = 'host'
export const GUEST_PLAYER_ID = 'guest'

interface P2PGameScreenProps {
  role: 'host' | 'guest'
  handle: PeerHandle
  hostName: string
  guestName: string
}

export function P2PGameScreen({ role, handle, hostName, guestName }: P2PGameScreenProps) {
  const initialState =
    role === 'host'
      ? createInitialState({
          players: [
            { id: HOST_PLAYER_ID, name: hostName, isAI: false },
            { id: GUEST_PLAYER_ID, name: guestName, isAI: false },
          ],
        })
      : undefined

  const localPlayerId = role === 'host' ? HOST_PLAYER_ID : GUEST_PLAYER_ID
  const { state, dispatch, legalActions, currentPlayerId, lastError, rematch } = useP2PGame({
    role,
    handle,
    localPlayerId,
    initialState,
  })

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  if (!state) {
    return (
      <div style={{ maxWidth: 480, margin: '40px auto' }}>
        <p>En attente de la partie...</p>
      </div>
    )
  }

  return (
    <Board
      state={state}
      legalActions={legalActions}
      currentPlayerId={currentPlayerId}
      lastError={lastError}
      dispatch={dispatch}
      onRematch={rematch}
      localPlayerId={localPlayerId}
    />
  )
}
