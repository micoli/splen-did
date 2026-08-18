import { useState } from 'react'
import type { PeerHandle } from '../../net/webrtc'
import { P2PHostScreen } from './P2PHostScreen'
import { P2PJoinScreen } from './P2PJoinScreen'

interface P2PSetupFlowProps {
  onConnected: (role: 'host' | 'guest', handle: PeerHandle) => void
}

type Choice = 'none' | 'host' | 'join'

export function P2PSetupFlow({ onConnected }: P2PSetupFlowProps) {
  const [choice, setChoice] = useState<Choice>('none')

  if (choice === 'none') {
    return (
      <div className="setup-panel">
        <h3>Partie en ligne (P2P, sans serveur)</h3>
        <p>Aucun serveur n'est utilise : un code doit etre echange manuellement entre les deux joueurs.</p>
        <div className="setup-panel__actions">
          <button type="button" onClick={() => setChoice('host')}>
            Heberger
          </button>
          <button type="button" onClick={() => setChoice('join')}>
            Rejoindre
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
