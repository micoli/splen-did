import { gameReducer } from '../engine/reducer'
import type { Action, GameState } from '../engine/types'
import type { PeerHandle } from './webrtc'
import { onMessage, sendMessage } from './webrtc'

export interface HostSession {
  submitAction: (action: Action, actingPlayerId: string) => void
}

/** Host runs the authoritative reducer. Guest intents are always attributed to `guestPlayerId`, never trusted from the message itself. */
export function createHostSession(
  handle: PeerHandle,
  initialState: GameState,
  guestPlayerId: string,
  onStateChange: (state: GameState) => void
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

  onMessage(handle, (message) => {
    if (message.type === 'intent') apply(message.action, guestPlayerId)
  })

  sendMessage(handle, { type: 'state', state: initialState })

  return { submitAction: apply }
}
