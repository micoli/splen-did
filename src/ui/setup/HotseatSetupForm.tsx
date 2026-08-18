import { useState } from 'react'
import type { PlayerConfig } from '../../engine/setup'

const NAMES_STORAGE_KEY = 'splendor:hotseatNames'

function loadStoredNames(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(NAMES_STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

interface HotseatSetupFormProps {
  onStart: (players: PlayerConfig[]) => void
}

export function HotseatSetupForm({ onStart }: HotseatSetupFormProps) {
  const [names, setNames] = useState(() => {
    const stored = loadStoredNames()
    return [stored[0] || 'Joueur 1', stored[1] || 'Joueur 2']
  })

  function updateNames(next: string[]) {
    setNames(next)
    localStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(next))
  }

  function setPlayerCount(count: number) {
    const stored = loadStoredNames()
    const next = [...names]
    while (next.length < count) next.push(stored[next.length] || `Joueur ${next.length + 1}`)
    updateNames(next.slice(0, count))
  }

  function handleSubmit() {
    const players: PlayerConfig[] = names.map((name, i) => ({ id: `p${i + 1}`, name: name.trim() || `Joueur ${i + 1}`, isAI: false }))
    onStart(players)
  }

  return (
    <div className="panel">
      <h3>Partie locale (pass-and-play)</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[2, 3, 4].map((count) => (
          <button key={count} type="button" className={names.length === count ? 'active' : ''} onClick={() => setPlayerCount(count)}>
            {count} joueurs
          </button>
        ))}
      </div>
      {names.map((name, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <input
            value={name}
            onChange={(e) => updateNames(names.map((n, idx) => (idx === i ? e.target.value : n)))}
            placeholder={`Joueur ${i + 1}`}
          />
        </div>
      ))}
      <button type="button" onClick={handleSubmit}>
        Commencer la partie
      </button>
    </div>
  )
}
