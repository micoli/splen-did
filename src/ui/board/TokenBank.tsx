import { TOKEN_COLORS } from '../../engine/types'
import type { GameState, TokenColor } from '../../engine/types'
import { TokenPile } from './TokenPile'

interface TokenBankProps {
  bank: GameState['bank']
  selectableColors?: TokenColor[]
  selectedColors?: TokenColor[]
  onSelectColor?: (color: TokenColor) => void
  highlightedColors?: TokenColor[]
}

export function TokenBank({ bank, selectableColors, selectedColors, onSelectColor, highlightedColors }: TokenBankProps) {
  return (
    <div className="token-bank">
      {TOKEN_COLORS.map((color) => (
        <TokenPile
          key={color}
          color={color}
          count={bank[color]}
          selected={selectedColors?.includes(color)}
          highlighted={highlightedColors?.includes(color)}
          onClick={selectableColors?.includes(color) ? () => onSelectColor?.(color) : undefined}
        />
      ))}
      <TokenPile color="gold" count={bank.gold} />
    </div>
  )
}
