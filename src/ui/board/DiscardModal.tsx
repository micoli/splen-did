import { useState } from 'react'
import { GemIcon } from '../shared/GemIcon'
import { TOKEN_COLORS } from '../../engine/types'
import type { PlayerState, Token } from '../../engine/types'

interface DiscardModalProps {
  player: PlayerState
  excess: number
  onDiscard: (tokens: Partial<Record<Token, number>>) => void
}

export function DiscardModal({ player, excess, onDiscard }: DiscardModalProps) {
  const [picked, setPicked] = useState<Partial<Record<Token, number>>>({})

  const pickedTotal = Object.values(picked).reduce((sum, n) => sum + (n ?? 0), 0)
  const tokens: Token[] = [...TOKEN_COLORS, 'gold']

  function adjust(token: Token, delta: number) {
    setPicked((prev) => {
      const current = prev[token] ?? 0
      const next = current + delta
      if (next < 0 || next > player.tokens[token]) return prev
      if (pickedTotal + delta > excess) return prev
      return { ...prev, [token]: next }
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Defausser {excess} jeton(s)</h3>
        <p>Vous avez plus de 10 jetons, choisissez lesquels defausser.</p>
        {tokens
          .filter((token) => player.tokens[token] > 0)
          .map((token) => (
            <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <GemIcon color={token} size="small" />
              <span>
                {picked[token] ?? 0} / {player.tokens[token]}
              </span>
              <button type="button" onClick={() => adjust(token, -1)} disabled={(picked[token] ?? 0) <= 0}>
                -
              </button>
              <button type="button" onClick={() => adjust(token, 1)} disabled={(picked[token] ?? 0) >= player.tokens[token]}>
                +
              </button>
            </div>
          ))}
        <button type="button" disabled={pickedTotal !== excess} onClick={() => onDiscard(picked)}>
          Confirmer la defausse
        </button>
      </div>
    </div>
  )
}
