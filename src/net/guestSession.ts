import type { Action, GameState } from '../engine/types'
import type { PeerHandle } from './webrtc'
import { onMessage, sendMessage } from './webrtc'

export interface GuestSession {
  submitIntent: (action: Action) => void
  rematch: () => void
}

/** Guest never runs the reducer locally: it sends intents and waits for the host's authoritative state echo. */
export function createGuestSession(
  handle: PeerHandle,
  onStateChange: (state: GameState) => void,
  onError: (message: string) => void
): GuestSession {
  onMessage(handle, (message) => {
    if (message.type === 'state') onStateChange(message.state)
    if (message.type === 'error') onError(message.message)
  })

  return {
    submitIntent: (action) => sendMessage(handle, { type: 'intent', action }),
    rematch: () => sendMessage(handle, { type: 'rematchRequest' }),
  }
}
