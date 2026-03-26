// lib/utils.ts

/**
 * Merge class names (simple utility without clsx dependency)
 */
export function cn(...classes: (string|undefined|null|false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(
    dateStr: string, options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }): string {
  return new Date(dateStr).toLocaleDateString('en-GB', options)
}

/**
 * Get the next draw date (1st of next month)
 */
export function getNextDrawDate(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

/**
 * Days until a given date
 */
export function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

/**
 * Truncate a string to a max length
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
    return str.slice(0, maxLen - 3) + '…'
}

/**
 * Validate a Stableford score
 */
export function isValidStablefordScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 45
}

/**
 * Generate a random hex color (for charity avatars fallback)
 */
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 50%, 35%)`
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
}

/**
 * Sleep helper for async delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if a subscription is currently active and valid
 */
export function isSubscriptionActive(subscription: {
  status: string
  current_period_end?: string | null
} | null): boolean {
    if (!subscription) return false
      if (subscription.status !== 'active') return false
      if (!subscription.current_period_end) return true
      return new Date(subscription.current_period_end) > new Date()
  }

  /**
   * Calculate prize pool amounts from revenue
   */
  export function getPrizePoolBreakdown(
      totalRevenueCents: number, rolloverCents = 0) {
    const prizePool = Math.floor(totalRevenueCents * 0.5) + rolloverCents
    const charityPool = Math.floor(totalRevenueCents * 0.1)
    return {
      prizePool, charityPool, jackpot: Math.floor(prizePool * 0.4),
          match4: Math.floor(prizePool * 0.35),
          match3: Math.floor(prizePool * 0.25),
    }
  }