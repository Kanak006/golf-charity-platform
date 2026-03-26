export type UserRole = 'subscriber'|'admin'
export type SubscriptionPlan = 'monthly'|'yearly'
export type SubscriptionStatus = 'active'|'inactive'|'cancelled'|'lapsed'
export type DrawType = 'random'|'algorithmic'
export type DrawStatus = 'pending'|'simulated'|'published'
export type MatchType = 'match_5'|'match_4'|'match_3'
export type PoolType = 'jackpot_5'|'match_4'|'match_3'
export type PaymentStatus =
    'pending'|'verification_required'|'verified'|'paid'|'rejected'

export interface Profile {
  id: string
  email: string
  full_name: string|null
  avatar_url: string|null
  role: UserRole
  selected_charity_id: string|null
  charity_percentage: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string|null
  stripe_subscription_id: string|null
  plan: SubscriptionPlan
  status: SubscriptionStatus
  amount_cents: number
  current_period_start: string|null
  current_period_end: string|null
  created_at: string
  updated_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  score_date: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string|null
  image_url: string|null
  website_url: string|null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  events?: CharityEvent[]
}

export interface CharityEvent {
  id: string
  charity_id: string
  title: string
  description: string|null
  event_date: string|null
  created_at: string
}

export interface Draw {
  id: string
  draw_date: string
  draw_type: DrawType
  winning_numbers: number[]
  status: DrawStatus
  jackpot_rollover: boolean
  rollover_amount_cents: number
  created_by: string|null
  published_at: string|null
  created_at: string
  prize_pools?: PrizePool[]
}

export interface PrizePool {
  id: string
  draw_id: string
  pool_type: PoolType
  total_amount_cents: number
  winners_count: number
  per_winner_amount_cents: number
  created_at: string
}

export interface Winner {
  id: string
  draw_id: string
  user_id: string
  match_type: MatchType
  matched_numbers: number[]|null
  prize_amount_cents: number
  payment_status: PaymentStatus
  proof_url: string|null
  admin_notes: string|null
  created_at: string
  updated_at: string
  profile?: Profile
  draw?: Draw
}

export interface CharityContribution {
  id: string
  user_id: string
  charity_id: string|null
  subscription_id: string|null
  amount_cents: number
  contribution_date: string
  created_at: string
}

// Stripe price IDs (set in env)
export const STRIPE_PRICES = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
  yearly: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!,
}

export const SUBSCRIPTION_AMOUNTS = {
  monthly: 999,  // £9.99 in pence
  yearly: 8999,  // £89.99 in pence
}

export const PRIZE_POOL_DISTRIBUTION = {
  jackpot_5: 0.40,
  match_4: 0.35,
  match_3: 0.25,
}

export const CHARITY_MIN_PERCENTAGE = 10
export const PRIZE_POOL_PERCENTAGE =
    0.50  // 50% of subscription goes to prize pool
export const CHARITY_POOL_PERCENTAGE = 0.10  // min 10% to charity