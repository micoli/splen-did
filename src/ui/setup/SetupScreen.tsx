import { useState } from 'react'
import type { PlayerConfig } from '../../engine/setup'
import { useLanguage } from '../../i18n/LanguageContext'
import type { PeerHandle } from '../../net/webrtc'
import { GemIcon } from '../shared/GemIcon'
import { LanguageToggle } from '../shared/LanguageToggle'
import { HotseatSetupForm } from './HotseatSetupForm'
import { ModeSelect } from './ModeSelect'
import type { GameMode } from './ModeSelect'
import { P2PSetupFlow } from './P2PSetupFlow'
import './setup.css'
import { SoloSetupForm } from './SoloSetupForm'

function formatBuildDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

interface SetupScreenProps {
  onStart: (players: PlayerConfig[]) => void
  onP2PConnected: (role: 'host' | 'guest', handle: PeerHandle) => void
}

export function SetupScreen({ onStart, onP2PConnected }: SetupScreenProps) {
  const [mode, setMode] = useState<GameMode>('solo')
  const { t } = useLanguage()

  return (
    <div className="setup-screen">
      <div className="setup-screen__inner">
        <div className="setup-screen__lang">
          <LanguageToggle />
        </div>
        <div className="setup-screen__header">
          <h1 className="setup-screen__title">
            <GemIcon color="blue" size="medium" />
            Splen-did
            <GemIcon color="red" size="medium" />
          </h1>
          <p className="setup-screen__tagline">{t.appTagline}</p>
        </div>
        <ModeSelect mode={mode} onSelect={setMode} />
        {mode === 'solo' && <SoloSetupForm onStart={onStart} />}
        {mode === 'hotseat' && <HotseatSetupForm onStart={onStart} />}
        {mode === 'p2p' && <P2PSetupFlow onConnected={onP2PConnected} />}
        <p className="setup-screen__build-date">{formatBuildDate(__BUILD_DATE__)}</p>
      </div>
    </div>
  )
}
