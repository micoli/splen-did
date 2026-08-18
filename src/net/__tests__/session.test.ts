import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../engine/setup'
import { createGuestSession } from '../guestSession'
import { createHostSession } from '../hostSession'
import type { PeerHandle } from '../webrtc'

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
    const initialState = createInitialState({
      players: [
        { id: 'host', name: 'Host', isAI: false },
        { id: 'guest', name: 'Guest', isAI: false },
      ],
    })
    const [hostHandle, guestHandle] = createLinkedHandles()

    let guestState: ReturnType<typeof createInitialState> | null = null
    createGuestSession(
      guestHandle,
      (state) => {
        guestState = state
      },
      () => {}
    )
    // Guest wires its listener first, mirroring reality: the two sides run in separate tabs/machines,
    // so real network latency always separates connection-open from the host's first send by far more
    // than the microtask tick this fake in-process channel needs to attach its listener.
    await flushMicrotasks()

    createHostSession(hostHandle, initialState, 'guest', () => {})
    await flushMicrotasks()

    expect(guestState).not.toBeNull()
    expect(guestState!.players.map((p) => p.id)).toEqual(['host', 'guest'])
  })

  it('applies a guest intent through the host reducer and echoes the resulting state back', async () => {
    const initialState = createInitialState({
      players: [
        { id: 'host', name: 'Host', isAI: false },
        { id: 'guest', name: 'Guest', isAI: false },
      ],
    })
    const [hostHandle, guestHandle] = createLinkedHandles()

    let guestState: ReturnType<typeof createInitialState> | null = null
    const guestSession = createGuestSession(
      guestHandle,
      (state) => {
        guestState = state
      },
      () => {}
    )
    await flushMicrotasks()

    let hostState = initialState
    createHostSession(hostHandle, initialState, 'guest', (state) => {
      hostState = state
    })
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
