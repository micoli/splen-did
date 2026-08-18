export type TokenColor = 'white' | 'blue' | 'green' | 'red' | 'black'

export type Token = TokenColor | 'gold'

export const TOKEN_COLORS: readonly TokenColor[] = ['white', 'blue', 'green', 'red', 'black']

export type CardLevel = 1 | 2 | 3

export interface CardDef {
  id: string
  level: CardLevel
  points: number
  bonus: TokenColor
  cost: Partial<Record<TokenColor, number>>
}

export interface NobleDef {
  id: string
  points: 3
  requirement: Partial<Record<TokenColor, number>>
}

export interface PlayerState {
  id: string
  name: string
  isAI: boolean
  tokens: Record<Token, number>
  bonuses: Record<TokenColor, number>
  reservedCardIds: string[]
  ownedCardIds: string[]
  nobleIds: string[]
}

export type TurnPhase = 'action' | 'discard' | 'nobleClaim'

export interface GameState {
  players: PlayerState[]
  currentPlayerIndex: number
  bank: Record<Token, number>
  decks: Record<CardLevel, string[]>
  visibleCards: Record<CardLevel, (string | null)[]>
  nobles: string[]
  turnPhase: TurnPhase
  roundEndTriggered: boolean
  finalRoundStartPlayerIndex: number | null
  winnerId: string | null
  gameOver: boolean
}

export type Action =
  | { type: 'TAKE_THREE_DIFFERENT'; colors: TokenColor[] }
  | { type: 'TAKE_TWO_SAME'; color: TokenColor }
  | { type: 'RESERVE_CARD'; cardId: string; fromLevel?: CardLevel }
  | {
      type: 'PURCHASE_CARD'
      cardId: string
      source: 'visible' | 'reserved'
      payment: Partial<Record<Token, number>>
    }
  | { type: 'DISCARD_TOKENS'; tokens: Partial<Record<Token, number>> }
  | { type: 'CLAIM_NOBLE'; nobleId: string }
