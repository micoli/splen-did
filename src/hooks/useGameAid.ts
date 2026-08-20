import { useCallback, useEffect, useState } from 'react'

const STORAGE_PREFIX = 'splen-did-game-aid:'

function readStored(playerName: string): boolean {
  const stored = localStorage.getItem(STORAGE_PREFIX + playerName)
  return stored === null ? true : stored === 'true'
}

/** Per-player preference (keyed by player name) for highlighting purchasable cards during the purchase phase. */
export function useGameAid(playerName: string) {
  const [enabled, setEnabled] = useState(() => readStored(playerName))

  useEffect(() => {
    setEnabled(readStored(playerName))
  }, [playerName])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_PREFIX + playerName, String(next))
      return next
    })
  }, [playerName])

  return { enabled, toggle }
}
