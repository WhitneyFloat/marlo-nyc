export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

export function formatPriceMonthly(dollars: number): string {
  return `$${dollars}/mo`
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}

export function spotsLabel(remaining: number | null): string {
  if (remaining === null) return 'Spots available'
  if (remaining === 0)    return 'Waitlist only'
  if (remaining <= 3)     return `${remaining} spot${remaining === 1 ? '' : 's'} left`
  return `${remaining} spots available`
}

export function matchScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent match'
  if (score >= 75) return 'Strong match'
  if (score >= 60) return 'Good match'
  return 'Possible match'
}
