import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import type { PeerHandle } from '../../net/webrtc'
import { P2PHostScreen } from './P2PHostScreen'
import { P2PJoinScreen } from './P2PJoinScreen'

interface P2PSetupFlowProps {
  onConnected: (role: 'host' | 'guest', handle: PeerHandle) => void
}

type Choice = 'none' | 'host' | 'join'

export function P2PSetupFlow({ onConnected }: P2PSetupFlowProps) {
  const { t } = useLanguage()
  const [choice, setChoice] = useState<Choice>('none')

  if (choice === 'none') {
    return (
      <div className="setup-panel">
        <h3>{t.p2pTitle}</h3>
        <p>{t.p2pDescription}</p>
        <div className="setup-panel__actions">
          <button type="button" onClick={() => setChoice('host')}>
            {t.p2pHost}
          </button>
          <button type="button" onClick={() => setChoice('join')}>
            {t.p2pJoin}
          </button>
        </div>
      </div>
    )
  }

  if (choice === 'host') {
    return <P2PHostScreen onConnected={(handle) => onConnected('host', handle)} />
  }

  return <P2PJoinScreen onConnected={(handle) => onConnected('guest', handle)} />
}
