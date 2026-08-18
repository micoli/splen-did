import { useState } from 'react'
import type { PlayerConfig } from '../../engine/setup'

const NAME_STORAGE_KEY = 'splendor:playerName'

interface SoloSetupFormProps {
  onStart: (players: PlayerConfig[]) => void
}

export function SoloSetupForm({ onStart }: SoloSetupFormProps) {
  const [name, setName] = useState(() => localStorage.getItem(NAME_STORAGE_KEY) || 'Joueur')

  function handleNameChange(value: string) {
    setName(value)
    localStorage.setItem(NAME_STORAGE_KEY, value)
  }

  function handleSubmit() {
    const players: PlayerConfig[] = [
      { id: 'p1', name: name.trim() || 'Joueur', isAI: false },
      { id: 'p2', name: 'IA', isAI: true },
    ]
    onStart(players)
  }

  return (
    <div className="panel">
      <h3>Solo contre l'ordinateur</h3>
      <div style={{ marginBottom: 12 }}>
        <input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Votre nom" />
      </div>
      <button type="button" onClick={handleSubmit}>
        Commencer la partie
      </button>
    </div>
  )
}
