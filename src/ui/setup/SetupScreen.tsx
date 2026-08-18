import { useState } from 'react'
import type { PlayerConfig } from '../../engine/setup'
import type { PeerHandle } from '../../net/webrtc'
import { HotseatSetupForm } from './HotseatSetupForm'
import { ModeSelect } from './ModeSelect'
import type { GameMode } from './ModeSelect'
import { P2PSetupFlow } from './P2PSetupFlow'
import { SoloSetupForm } from './SoloSetupForm'

interface SetupScreenProps {
  onStart: (players: PlayerConfig[]) => void
  onP2PConnected: (role: 'host' | 'guest', handle: PeerHandle) => void
}

export function SetupScreen({ onStart, onP2PConnected }: SetupScreenProps) {
  const [mode, setMode] = useState<GameMode>('solo')

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: '0 16px' }}>
      <h1>Splendor</h1>
      <ModeSelect mode={mode} onSelect={setMode} />
      {mode === 'solo' && <SoloSetupForm onStart={onStart} />}
      {mode === 'hotseat' && <HotseatSetupForm onStart={onStart} />}
      {mode === 'p2p' && <P2PSetupFlow onConnected={onP2PConnected} />}
    </div>
  )
}
