// lib/draw-engine.ts
import type {DrawType, Score} from '/types'

export interface DrawResult {
  winning_numbers: number[]
  draw_type: DrawType
  generated_at: string
}

/**
 * Generate 5 random Stableford numbers (1-45)
 */
export function randomDraw(): DrawResult {
    const numbers: number[] = [];
    while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(n)) numbers.push(n) }
  return {
    winning_numbers: numbers.sort((a, b) => a - b), draw_type: 'random',
        generated_at: new Date().toISOString(),
  }
}

/**
 * Algorithmic draw: weighted by frequency of user scores
 * Less frequent scores get higher weight (to encourage variety)
 */
export function algorithmicDraw(allScores: Score[]): DrawResult {
  if (allScores.length < 5) return randomDraw()

    // Build frequency map
    const freq: Record<number, number> = {};
    for (let i = 1; i <= 45; i++)
        freq[i] = 0
    allScores.forEach(s => {freq[s.score] = (freq[s.score] || 0) + 1})

    // Invert frequency: less common = higher weight
    const maxFreq = Math.max(...Object.values(freq))
    const weights: number[] = [];
    const nums: number[] = []

        for (let i = 1; i <= 45; i++) {
      nums.push(i)
      weights.push(maxFreq - freq[i] + 1)
    }

  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const selected: number[] = []

      while (selected.length < 5) {
    let rand = Math.random() * totalWeight
    for (let i = 0; i < nums.length; i++) {
        rand -= weights[i];
        if (rand <= 0 && !selected.includes(nums[i])) {
        selected.push(nums[i])
        break
      }
    }
  }

  return {
    winning_numbers: selected.sort((a, b) => a - b), draw_type: 'algorithmic',
        generated_at: new Date().toISOString(),
  }
}

/**
 * Check a user's 5 scores against winning numbers
 */
export function checkMatch(userScores: number[], winningNumbers: number[]):
    {matchType: 'match_5'|'match_4'|'match_3'|null; matchedNumbers: number[]} {
  const matched = userScores.filter(s => winningNumbers.includes(s))

  if (matched.length >= 5) return {
    matchType: 'match_5', matchedNumbers: matched
  }
  if (matched.length === 4) return {
      matchType: 'match_4', matchedNumbers: matched
    }
  if (matched.length === 3) return {
      matchType: 'match_3', matchedNumbers: matched
    }
  return {
    matchType: null, matchedNumbers: matched
  }
}

/**
 * Calculate prize pool amounts from active subscriber count
 */
export function calculatePrizePools(
    activeSubscribers: number, avgSubscriptionCents: number,
    rolloverAmountCents: number = 0): {jackpot_5: number
match_4: number
match_3: number
charity_total: number
  total_pool: number
} {
    const totalRevenue = activeSubscribers * avgSubscriptionCents
    const prizePoolTotal = Math.floor(totalRevenue * 0.50) + rolloverAmountCents
    const charityTotal = Math.floor(totalRevenue * 0.10)

    return {
      jackpot_5: Math.floor(prizePoolTotal * 0.40),
          match_4: Math.floor(prizePoolTotal * 0.35),
          match_3: Math.floor(prizePoolTotal * 0.25),
          charity_total: charityTotal, total_pool: prizePoolTotal,
    }
  }

  /**
   * Format pence to display currency
   */
  export function formatCurrency(cents: number, currency = 'GBP'): string {
    return new Intl
        .NumberFormat('en-GB', {
          style: 'currency',
          currency,
        })
        .format(cents / 100)
  }