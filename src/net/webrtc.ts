import type { ProtocolMessage } from './protocol'

const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]

export interface PeerHandle {
  pc: RTCPeerConnection
  /** The data channel only becomes available once the underlying connection is actually established. */
  channelReady: Promise<RTCDataChannel>
}

function waitForIceGatheringComplete(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve()
  return new Promise((resolve) => {
    function check() {
      if (pc.iceGatheringState !== 'complete') return
      pc.removeEventListener('icegatheringstatechange', check)
      resolve()
    }
    pc.addEventListener('icegatheringstatechange', check)
  })
}

function encodeBlob(description: RTCSessionDescriptionInit): string {
  return btoa(JSON.stringify(description))
}

function decodeBlob(blob: string): RTCSessionDescriptionInit {
  return JSON.parse(atob(blob.trim()))
}

export async function createOffer(): Promise<{ handle: PeerHandle; offerBlob: string }> {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
  const channel = pc.createDataChannel('game')
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  await waitForIceGatheringComplete(pc)
  return { handle: { pc, channelReady: Promise.resolve(channel) }, offerBlob: encodeBlob(pc.localDescription!) }
}

export async function createAnswerFromOffer(offerBlob: string): Promise<{ handle: PeerHandle; answerBlob: string }> {
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
  // ondatachannel only fires once the peer connection actually establishes (after acceptAnswer on the host side),
  // so this must not block answer generation below - the answer has to reach the host before the channel can exist.
  const channelReady = new Promise<RTCDataChannel>((resolve) => {
    pc.ondatachannel = (event) => resolve(event.channel)
  })

  await pc.setRemoteDescription(decodeBlob(offerBlob))
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  await waitForIceGatheringComplete(pc)

  return { handle: { pc, channelReady }, answerBlob: encodeBlob(pc.localDescription!) }
}

export async function acceptAnswer(handle: PeerHandle, answerBlob: string): Promise<void> {
  await handle.pc.setRemoteDescription(decodeBlob(answerBlob))
}

export async function onMessage(handle: PeerHandle, listener: (message: ProtocolMessage) => void): Promise<void> {
  const channel = await handle.channelReady
  channel.onmessage = (event) => listener(JSON.parse(event.data))
}

export async function sendMessage(handle: PeerHandle, message: ProtocolMessage): Promise<void> {
  const channel = await handle.channelReady
  channel.send(JSON.stringify(message))
}

export function onConnectionStateChange(handle: PeerHandle, listener: (state: RTCPeerConnectionState) => void): void {
  handle.pc.onconnectionstatechange = () => listener(handle.pc.connectionState)
}

export async function onChannelOpen(handle: PeerHandle, listener: () => void): Promise<void> {
  const channel = await handle.channelReady
  if (channel.readyState === 'open') {
    listener()
    return
  }
  channel.onopen = listener
}
