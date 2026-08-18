interface PrestigeBadgeProps {
  points: number
}

export function PrestigeBadge({ points }: PrestigeBadgeProps) {
  if (points <= 0) return null
  return <span className="prestige-badge">{points}</span>
}
