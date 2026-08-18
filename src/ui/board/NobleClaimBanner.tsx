import { getNobleDef } from '../../engine/selectors'
import { NobleTile } from './NobleTile'

interface NobleClaimBannerProps {
  eligibleNobleIds: string[]
  onClaim: (nobleId: string) => void
}

export function NobleClaimBanner({ eligibleNobleIds, onClaim }: NobleClaimBannerProps) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Choisissez un noble</h3>
        <p>Plusieurs nobles peuvent vous rendre visite, choisissez lequel.</p>
        <div className="noble-row">
          {eligibleNobleIds.map((id) => (
            <NobleTile key={id} noble={getNobleDef(id)} claimable onClick={() => onClaim(id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
