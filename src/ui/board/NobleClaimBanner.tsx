import { getNobleDef } from '../../engine/selectors'
import { useLanguage } from '../../i18n/LanguageContext'
import { NobleTile } from './NobleTile'

interface NobleClaimBannerProps {
  eligibleNobleIds: string[]
  onClaim: (nobleId: string) => void
}

export function NobleClaimBanner({ eligibleNobleIds, onClaim }: NobleClaimBannerProps) {
  const { t } = useLanguage()
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{t.nobleTitle}</h3>
        <p>{t.nobleDescription}</p>
        <div className="noble-row">
          {eligibleNobleIds.map((id) => (
            <NobleTile key={id} noble={getNobleDef(id)} claimable onClick={() => onClaim(id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
