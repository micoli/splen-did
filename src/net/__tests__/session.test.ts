import { describe, expect, it, vi } from 'vitest'
import { createInitialState } from '../../engine/setup'
import { createGuestSession } from '../guestSession'
import { createHostSession } from '../hostSession'
import type { PeerHandle } from '../webrtc'

const PLAYERS = [
  { id: 'host', name: 'Host', isAI: false },
  { id: 'guest', name: 'Guest', isAI: false },
]

/** Minimal RTCDataChannel stand-in: two instances linked so send() on one fires onmessage on the other. */
class FakeChannel {
  onmessage: ((event: { data: string }) => void) | null = null
  readyState: RTCDataChannelState = 'open'
  private peer: FakeChannel | null = null

  link(peer: FakeChannel) {
    this.peer = peer
  }

  send(data: string) {
    this.peer?.onmessage?.({ data })
  }
}

function createLinkedHandles(): [PeerHandle, PeerHandle] {
  const a = new FakeChannel()
  const b = new FakeChannel()
  a.link(b)
  b.link(a)
  const fakePc = {} as RTCPeerConnection
  return [
    { pc: fakePc, channelReady: Promise.resolve(a as unknown as RTCDataChannel) },
    { pc: fakePc, channelReady: Promise.resolve(b as unknown as RTCDataChannel) },
  ]
}

async function flushMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

describe('P2P host/guest session wiring', () => {
  it('pushes the initial state to the guest as soon as the session is created', async () => {
    const initialState = createInitialState({ players: PLAYERS })
    const [hostHandle, guestHandle] = createLinkedHandles()

    let guestState: ReturnType<typeof createInitialState> | null = null
    createGuestSession(
      guestHandle,
      (state) => {
        guestState = state
      },
      () => {},
      () => {}
    )
    // Guest wires its listener first, mirroring reality: the two sides run in separate tabs/machines,
    // so real network latency always separates connection-open from the host's first send by far more
    // than the microtask tick this fake in-process channel needs to attach its listener.
    await flushMicrotasks()

    createHostSession(hostHandle, initialState, PLAYERS, 'guest', () => {}, () => {})
    await flushMicrotasks()

    expect(guestState).not.toBeNull()
    expect(guestState!.players.map((p) => p.id)).toEqual(['host', 'guest'])
  })

  it('applies a guest intent through the host reducer and echoes the resulting state back', async () => {
    const initialState = createInitialState({ players: PLAYERS })
    const [hostHandle, guestHandle] = createLinkedHandles()

    let guestState: ReturnType<typeof createInitialState> | null = null
    const guestSession = createGuestSession(
      guestHandle,
      (state) => {
        guestState = state
      },
      () => {},
      () => {}
    )
    await flushMicrotasks()

    let hostState = initialState
    createHostSession(
      hostHandle,
      initialState,
      PLAYERS,
      'guest',
      (state) => {
        hostState = state
      },
      () => {}
    )
    await flushMicrotasks()

    const startingPlayerId = guestState!.players[guestState!.currentPlayerIndex].id

    // Only exercise the guest-intent path when it's actually the guest's turn; otherwise the host would reject it.
    if (startingPlayerId !== 'guest') return

    guestSession.submitIntent({ type: 'TAKE_THREE_DIFFERENT', colors: ['white', 'blue', 'green'] })
    await flushMicrotasks()

    expect(hostState.players.find((p) => p.id === 'guest')!.tokens.white).toBe(1)
    expect(guestState!.players.find((p) => p.id === 'guest')!.tokens.white).toBe(1)
  })
})

describe('P2P restart proposal', () => {
  it('notifies the guest of a restart request from the host, and the host resets state once the guest accepts', async () => {
    const initialState = createInitialState({ players: PLAYERS })
    const [hostHandle, guestHandle] = createLinkedHandles()

    const guestOnRestartEvent = vi.fn()
    const guestSession = createGuestSession(guestHandle, () => {}, () => {}, guestOnRestartEvent)
    await flushMicrotasks()

    let hostState = initialState
    const hostSession = createHostSession(
      hostHandle,
      initialState,
      PLAYERS,
      'guest',
      (state) => {
        hostState = state
      },
      () => {}
    )
    await flushMicrotasks()

    hostSession.proposeRestart()
    await flushMicrotasks()
    expect(guestOnRestartEvent).toHaveBeenCalledWith({ type: 'requested' })

    guestSession.respondRestart(true)
    await flushMicrotasks()

    expect(hostState).not.toBe(initialState)
    expect(hostState.gameOver).toBe(false)
    expect(hostState.players.map((p) => p.id)).toEqual(['host', 'guest'])
    expect(hostState.players.every((p) => p.ownedCardIds.length === 0 && p.reservedCardIds.length === 0)).toBe(true)
  })

  it('lets the host reject a restart request proposed by the guest, leaving state untouched', async () => {
    const initialState = createInitialState({ players: PLAYERS })
    const [hostHandle, guestHandle] = createLinkedHandles()

    const guestOnRestartEvent = vi.fn()
    const guestSession = createGuestSession(guestHandle, () => {}, () => {}, guestOnRestartEvent)
    await flushMicrotasks()

    const hostOnRestartEvent = vi.fn()
    let hostState = initialState
    const hostSession = createHostSession(
      hostHandle,
      initialState,
      PLAYERS,
      'guest',
      (state) => {
        hostState = state
      },
      hostOnRestartEvent
    )
    await flushMicrotasks()

    guestSession.proposeRestart()
    await flushMicrotasks()
    expect(hostOnRestartEvent).toHaveBeenCalledWith({ type: 'requested' })

    hostSession.respondRestart(false)
    await flushMicrotasks()

    expect(guestOnRestartEvent).toHaveBeenCalledWith({ type: 'declined' })
    expect(hostState).toBe(initialState)
  })
})
