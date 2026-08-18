import { createInitialState } from '../engine/setup'
import type { PlayerConfig } from '../engine/setup'
import { gameReducer } from '../engine/reducer'
import type { Action, GameState } from '../engine/types'
import type { RestartEvent } from './protocol'
import type { PeerHandle } from './webrtc'
import { onMessage, sendMessage } from './webrtc'

export interface HostSession {
  submitAction: (action: Action, actingPlayerId: string) => void
  rematch: () => void
  proposeRestart: () => void
  respondRestart: (accept: boolean) => void
}

/** Host runs the authoritative reducer. Guest intents are always attributed to `guestPlayerId`, never trusted from the message itself. */
export function createHostSession(
  handle: PeerHandle,
  initialState: GameState,
  players: PlayerConfig[],
  guestPlayerId: string,
  onStateChange: (state: GameState) => void,
  onRestartEvent: (event: RestartEvent) => void
): HostSession {
  let state = initialState

  function apply(action: Action, actingPlayerId: string) {
    const { state: next, error } = gameReducer(state, action, actingPlayerId)
    if (error) {
      sendMessage(handle, { type: 'error', message: error })
      return
    }
    state = next
    onStateChange(state)
    sendMessage(handle, { type: 'state', state })
  }

  function rematch() {
    state = createInitialState({ players })
    onStateChange(state)
    sendMessage(handle, { type: 'state', state })
  }

  function proposeRestart() {
    sendMessage(handle, { type: 'restartRequest' })
  }

  function respondRestart(accept: boolean) {
    sendMessage(handle, { type: 'restartResponse', accept })
    if (accept) rematch()
  }

  onMessage(handle, (message) => {
    if (message.type === 'intent') apply(message.action, guestPlayerId)
    if (message.type === 'rematchRequest') rematch()
    if (message.type === 'restartRequest') onRestartEvent({ type: 'requested' })
    if (message.type === 'restartResponse') {
      if (message.accept) rematch()
      onRestartEvent({ type: message.accept ? 'accepted' : 'declined' })
    }
  })

  sendMessage(handle, { type: 'state', state: initialState })

  return { submitAction: apply, rematch, proposeRestart, respondRestart }
}
