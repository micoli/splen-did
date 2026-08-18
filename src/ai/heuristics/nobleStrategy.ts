import { getNobleDef } from '../../engine/selectors'
import type { NobleDef } from '../../engine/types'

/** When several nobles are claimable at once, prefer the one with the steepest requirement (hardest to get elsewhere later). */
export function pickHardestNoble(nobleIds: string[]): NobleDef {
  const nobles = nobleIds.map(getNobleDef)
  return nobles.reduce((hardest, noble) => (requirementSum(noble) > requirementSum(hardest) ? noble : hardest))
}

function requirementSum(noble: NobleDef): number {
  return Object.values(noble.requirement).reduce((sum, amount) => sum + amount, 0)
}
