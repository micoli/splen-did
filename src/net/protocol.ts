import type { Action, GameState } from '../engine/types'

export type ProtocolMessage =
  | { type: 'hello'; playerId: string; name: string }
  | { type: 'intent'; action: Action }
  | { type: 'state'; state: GameState }
  | { type: 'error'; message: string }
  | { type: 'rematchRequest' }
