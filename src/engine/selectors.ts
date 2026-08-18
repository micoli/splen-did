import { CARDS_BY_ID } from './data/cards'
import { NOBLES } from './data/nobles'
import type { GameState, NobleDef, PlayerState, Token } from './types'

const NOBLES_BY_ID: Record<string, NobleDef> = Object.fromEntries(NOBLES.map((n) => [n.id, n]))

export function getNobleDef(nobleId: string): NobleDef {
  const noble = NOBLES_BY_ID[nobleId]
  if (!noble) throw new Error(`Unknown noble id: ${nobleId}`)
  return noble
}

export function getCardDef(cardId: string) {
  const card = CARDS_BY_ID[cardId]
  if (!card) throw new Error(`Unknown card id: ${cardId}`)
  return card
}

export function currentPlayer(state: GameState): PlayerState {
  return state.players[state.currentPlayerIndex]
}

export function playerPrestige(player: PlayerState): number {
  const cardPoints = player.ownedCardIds.reduce((sum, id) => sum + getCardDef(id).points, 0)
  const noblePoints = player.nobleIds.reduce((sum, id) => sum + getNobleDef(id).points, 0)
  return cardPoints + noblePoints
}

export function totalTokens(player: PlayerState): number {
  return (Object.values(player.tokens) as number[]).reduce((sum, n) => sum + n, 0)
}

export function findPlayer(state: GameState, playerId: string): PlayerState {
  const player = state.players.find((p) => p.id === playerId)
  if (!player) throw new Error(`Unknown player id: ${playerId}`)
  return player
}

export function playerIndex(state: GameState, playerId: string): number {
  return state.players.findIndex((p) => p.id === playerId)
}

export function visibleCardIds(state: GameState): string[] {
  return [...state.visibleCards[1], ...state.visibleCards[2], ...state.visibleCards[3]].filter(
    (id): id is string => id !== null
  )
}

export function tokenNonGoldTotal(tokens: Partial<Record<Token, number>>): number {
  let sum = 0
  for (const [color, count] of Object.entries(tokens)) {
    if (color === 'gold') continue
    sum += count ?? 0
  }
  return sum
}
