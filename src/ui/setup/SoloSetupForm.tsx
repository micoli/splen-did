import { useState } from 'react'
import type { PlayerConfig } from '../../engine/setup'
import { useLanguage } from '../../i18n/LanguageContext'

const NAME_STORAGE_KEY = 'Splen-did:playerName'

interface SoloSetupFormProps {
  onStart: (players: PlayerConfig[]) => void
}

export function SoloSetupForm({ onStart }: SoloSetupFormProps) {
  const { t } = useLanguage()
  const [name, setName] = useState(() => localStorage.getItem(NAME_STORAGE_KEY) || t.defaultPlayerName)

  function handleNameChange(value: string) {
    setName(value)
    localStorage.setItem(NAME_STORAGE_KEY, value)
  }

  function handleSubmit() {
    const players: PlayerConfig[] = [
      { id: 'p1', name: name.trim() || t.defaultPlayerName, isAI: false },
      { id: 'p2', name: t.aiName, isAI: true },
    ]
    onStart(players)
  }

  return (
    <div className="setup-panel">
      <h3>{t.soloTitle}</h3>
      <div className="setup-panel__field">
        <input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder={t.namePlaceholder} />
      </div>
      <button type="button" className="setup-panel__cta" onClick={handleSubmit}>
        {t.startGame}
      </button>
    </div>
  )
}
