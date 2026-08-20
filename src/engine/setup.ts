import { CARDS_BY_LEVEL } from './data/cards'
import { NOBLES } from './data/nobles'
import { GOLD_TOKENS, NOBLES_DRAWN_BY_PLAYER_COUNT, STANDARD_TOKENS_BY_PLAYER_COUNT } from './data/tokenBank'
import { TOKEN_COLORS } from './types'
import type { CardLevel, GameState, PlayerState, Token } from './types'

export interface PlayerConfig {
  id: string
  name: string
  isAI: boolean
}

export interface SetupConfig {
  players: PlayerConfig[]
  rng?: () => number
}

// mulberry32: small deterministic PRNG, used to make solo/AI games reproducible from a seed in the URL.
export function createSeededRng(seed: number): () => number {
  let a = seed | 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function emptyTokenRecord(): Record<Token, number> {
  return { white: 0, blue: 0, green: 0, red: 0, black: 0, gold: 0 }
}

function createPlayer(config: PlayerConfig): PlayerState {
  return {
    id: config.id,
    name: config.name,
    isAI: config.isAI,
    tokens: emptyTokenRecord(),
    bonuses: { white: 0, blue: 0, green: 0, red: 0, black: 0 },
    reservedCardIds: [],
    ownedCardIds: [],
    nobleIds: [],
  }
}

export function createInitialState(config: SetupConfig): GameState {
  const rng = config.rng ?? Math.random
  const playerCount = config.players.length as 2 | 3 | 4

  const bank = emptyTokenRecord()
  const tokensPerColor = STANDARD_TOKENS_BY_PLAYER_COUNT[playerCount]
  for (const color of TOKEN_COLORS) {
    bank[color] = tokensPerColor
  }
  bank.gold = GOLD_TOKENS

  const decks: Record<CardLevel, string[]> = {
    1: shuffle(CARDS_BY_LEVEL[1].map((c) => c.id), rng),
    2: shuffle(CARDS_BY_LEVEL[2].map((c) => c.id), rng),
    3: shuffle(CARDS_BY_LEVEL[3].map((c) => c.id), rng),
  }

  const visibleCards: Record<CardLevel, (string | null)[]> = {
    1: [decks[1].pop() ?? null, decks[1].pop() ?? null, decks[1].pop() ?? null, decks[1].pop() ?? null],
    2: [decks[2].pop() ?? null, decks[2].pop() ?? null, decks[2].pop() ?? null, decks[2].pop() ?? null],
    3: [decks[3].pop() ?? null, decks[3].pop() ?? null, decks[3].pop() ?? null, decks[3].pop() ?? null],
  }

  const nobleCount = NOBLES_DRAWN_BY_PLAYER_COUNT[playerCount]
  const nobles = shuffle(
    NOBLES.map((n) => n.id),
    rng
  ).slice(0, nobleCount)

  return {
    players: config.players.map(createPlayer),
    currentPlayerIndex: 0,
    bank,
    decks,
    visibleCards,
    nobles,
    turnPhase: 'action',
    roundEndTriggered: false,
    finalRoundStartPlayerIndex: null,
    winnerId: null,
    gameOver: false,
  }
}
