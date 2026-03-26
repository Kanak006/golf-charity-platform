// lib/prize-calculator.ts
import {PRIZE_POOL_DISTRIBUTION} from '@/types'

export interface PrizePoolResult {
  jackpot_5: number
  match_4: number
  match_3: number
  total: number
  rollover_used: number
}

/**
 * Calculate prize pool amounts given subscriber count,
 * average subscription amount, and optional rollover.
 */
export function calculatePrizePools(
    activeSubscribers: number, avgSubscriptionCents: number,
    rolloverCents = 0): PrizePoolResult {
  const totalRevenue = activeSubscribers * avgSubscriptionCents
  // 50% of revenue goes to prize pool
  const prizeBase = Math.floor(totalRevenue * 0.5)
  const total = prizeBase + rolloverCents

  return {
    jackpot_5: Math.floor(total * PRIZE_POOL_DISTRIBUTION.jackpot_5),
        match_4: Math.floor(total * PRIZE_POOL_DISTRIBUTION.match_4),
        match_3: Math.floor(total * PRIZE_POOL_DISTRIBUTION.match_3), total,
        rollover_used: rolloverCents,
  }
}

/**
 * Split a pool among a number of winners (integer division, remainder ignored)
 */
export function splitPrize(poolCents: number, winnerCount: number): number {
  if (winnerCount <= 0) return 0
    return Math.floor(poolCents / winnerCount)
}

/**
 * Calculate how much charity contribution to log per subscription payment
 */
export function calculateCharityContribution(
    subscriptionAmountCents: number, charityPercentage: number): number {
  const pct = Math.max(10, Math.min(100, charityPercentage))
  return Math.floor(subscriptionAmountCents * (pct / 100))
}