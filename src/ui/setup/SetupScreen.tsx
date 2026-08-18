import { useState } from 'react'
import type { PlayerConfig } from '../../engine/setup'
import type { PeerHandle } from '../../net/webrtc'
import { GemIcon } from '../shared/GemIcon'
import { HotseatSetupForm } from './HotseatSetupForm'
import { ModeSelect } from './ModeSelect'
import type { GameMode } from './ModeSelect'
import { P2PSetupFlow } from './P2PSetupFlow'
import './setup.css'
import { SoloSetupForm } from './SoloSetupForm'

interface SetupScreenProps {
  onStart: (players: PlayerConfig[]) => void
  onP2PConnected: (role: 'host' | 'guest', handle: PeerHandle) => void
}

export function SetupScreen({ onStart, onP2PConnected }: SetupScreenProps) {
  const [mode, setMode] = useState<GameMode>('solo')

  return (
    <div className="setup-screen">
      <div className="setup-screen__inner">
        <div className="setup-screen__header">
          <h1 className="setup-screen__title">
            <GemIcon color="blue" size="medium" />
            Splen-did
            <GemIcon color="red" size="medium" />
          </h1>
          <p className="setup-screen__tagline">Collectionnez des gemmes, courtisez des nobles, gagnez la partie.</p>
        </div>
        <ModeSelect mode={mode} onSelect={setMode} />
        {mode === 'solo' && <SoloSetupForm onStart={onStart} />}
        {mode === 'hotseat' && <HotseatSetupForm onStart={onStart} />}
        {mode === 'p2p' && <P2PSetupFlow onConnected={onP2PConnected} />}
      </div>
    </div>
  )
}
