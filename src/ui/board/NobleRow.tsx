import { getNobleDef } from '../../engine/selectors'
import { NobleTile } from './NobleTile'

interface NobleRowProps {
  nobleIds: string[]
  claimableNobleIds?: string[]
  onClaim?: (nobleId: string) => void
}

export function NobleRow({ nobleIds, claimableNobleIds, onClaim }: NobleRowProps) {
  return (
    <div className="noble-row">
      {nobleIds.map((id) => (
        <NobleTile
          key={id}
          noble={getNobleDef(id)}
          claimable={claimableNobleIds?.includes(id)}
          onClick={() => onClaim?.(id)}
        />
      ))}
    </div>
  )
}
