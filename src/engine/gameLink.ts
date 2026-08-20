import type { PlayerConfig } from './setup'

export interface GameLink {
  seed: number
  players: PlayerConfig[]
}

function encodeBase64(value: string): string {
  return btoa(encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))))
}

function decodeBase64(value: string): string {
  return decodeURIComponent(
    atob(value)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  )
}

export function encodeGameLink(seed: number, players: PlayerConfig[]): string {
  const params = new URLSearchParams({ seed: String(seed), players: encodeBase64(JSON.stringify(players)) })
  return `#${params.toString()}`
}

export function decodeGameLink(hash: string): GameLink | null {
  if (!hash.startsWith('#')) return null
  const params = new URLSearchParams(hash.slice(1))
  const seedRaw = params.get('seed')
  const playersRaw = params.get('players')
  if (!seedRaw || !playersRaw) return null
  const seed = Number(seedRaw)
  if (!Number.isFinite(seed)) return null
  try {
    const players = JSON.parse(decodeBase64(playersRaw))
    if (!Array.isArray(players)) return null
    return { seed, players }
  } catch {
    return null
  }
}
