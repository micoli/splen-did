import type { Action, GameState } from '../engine/types'
import type { RestartEvent } from './protocol'
import type { PeerHandle } from './webrtc'
import { onMessage, sendMessage } from './webrtc'

export interface GuestSession {
  submitIntent: (action: Action) => void
  rematch: () => void
  proposeRestart: () => void
  respondRestart: (accept: boolean) => void
}

/** Guest never runs the reducer locally: it sends intents and waits for the host's authoritative state echo. */
export function createGuestSession(
  handle: PeerHandle,
  onStateChange: (state: GameState) => void,
  onError: (message: string) => void,
  onRestartEvent: (event: RestartEvent) => void
): GuestSession {
  onMessage(handle, (message) => {
    if (message.type === 'state') onStateChange(message.state)
    if (message.type === 'error') onError(message.message)
    if (message.type === 'restartRequest') onRestartEvent({ type: 'requested' })
    if (message.type === 'restartResponse') onRestartEvent({ type: message.accept ? 'accepted' : 'declined' })
  })

  return {
    submitIntent: (action) => sendMessage(handle, { type: 'intent', action }),
    rematch: () => sendMessage(handle, { type: 'rematchRequest' }),
    proposeRestart: () => sendMessage(handle, { type: 'restartRequest' }),
    respondRestart: (accept) => sendMessage(handle, { type: 'restartResponse', accept }),
  }
}
