import { createInitialState } from '../engine/setup'
import { useBeforeUnloadWarning } from '../hooks/useBeforeUnloadWarning'
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
  onExit: () => void
}

export function P2PGameScreen({ role, handle, hostName, guestName, onExit }: P2PGameScreenProps) {
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
  const { state, dispatch, legalActions, currentPlayerId, lastError, rematch, restartPhase, proposeRestart, respondRestart } =
    useP2PGame({
      role,
      handle,
      localPlayerId,
      initialState,
    })

  useBeforeUnloadWarning()

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
      onExit={onExit}
      localPlayerId={localPlayerId}
      onProposeRestart={proposeRestart}
      restartAwaiting={restartPhase === 'awaitingPeer'}
      restartPrompt={restartPhase === 'peerRequested' ? "L'adversaire propose de redemarrer la partie. Acceptez-vous ?" : undefined}
      onRespondRestart={respondRestart}
    />
  )
}
