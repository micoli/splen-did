import { useState } from 'react'
import type { PlayerConfig } from './engine/setup'
import type { PeerHandle } from './net/webrtc'
import { GameScreen } from './ui/GameScreen'
import { P2PGameScreen } from './ui/P2PGameScreen'
import { SetupScreen } from './ui/setup/SetupScreen'

interface LocalSession {
  type: 'local'
  players: PlayerConfig[]
  key: number
}

interface P2PSession {
  type: 'p2p'
  role: 'host' | 'guest'
  handle: PeerHandle
  key: number
}

type Session = LocalSession | P2PSession

function App() {
  const [session, setSession] = useState<Session | null>(null)

  if (!session) {
    return (
      <SetupScreen
        onStart={(players) => setSession({ type: 'local', players, key: Date.now() })}
        onP2PConnected={(role, handle) => setSession({ type: 'p2p', role, handle, key: Date.now() })}
      />
    )
  }

  if (session.type === 'local') {
    return <GameScreen key={session.key} players={session.players} onRematch={() => setSession(null)} />
  }

  return (
    <P2PGameScreen
      key={session.key}
      role={session.role}
      handle={session.handle}
      hostName="Hote"
      guestName="Invite"
      onRematch={() => setSession(null)}
    />
  )
}

export default App
