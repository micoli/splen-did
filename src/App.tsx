import { useState } from 'react'
import { decodeGameLink } from './engine/gameLink'
import type { PlayerConfig } from './engine/setup'
import type { PeerHandle } from './net/webrtc'
import { GameScreen } from './ui/GameScreen'
import { P2PGameScreen } from './ui/P2PGameScreen'
import { SetupScreen } from './ui/setup/SetupScreen'

interface LocalSession {
  type: 'local'
  players: PlayerConfig[]
  key: number
  seed?: number
}

interface P2PSession {
  type: 'p2p'
  role: 'host' | 'guest'
  handle: PeerHandle
  key: number
}

type Session = LocalSession | P2PSession

function initialSession(): Session | null {
  const link = decodeGameLink(window.location.hash)
  if (!link) return null
  return { type: 'local', players: link.players, key: Date.now(), seed: link.seed }
}

function clearHash() {
  history.replaceState(null, '', window.location.pathname + window.location.search)
}

function App() {
  const [session, setSession] = useState<Session | null>(initialSession)

  if (!session) {
    return (
      <SetupScreen
        onStart={(players) => setSession({ type: 'local', players, key: Date.now() })}
        onP2PConnected={(role, handle) => setSession({ type: 'p2p', role, handle, key: Date.now() })}
      />
    )
  }

  if (session.type === 'local') {
    return (
      <GameScreen
        key={session.key}
        players={session.players}
        initialSeed={session.seed}
        onRematch={() => {
          clearHash()
          setSession(null)
        }}
        onExit={() => {
          clearHash()
          setSession(null)
        }}
      />
    )
  }

  return (
    <P2PGameScreen
      key={session.key}
      role={session.role}
      handle={session.handle}
      hostName="Hote"
      guestName="Invite"
      onExit={() => setSession(null)}
    />
  )
}

export default App
