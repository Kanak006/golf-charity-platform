// app/api/draws/run/route.ts

import {
  algorithmicDraw,
  calculatePrizePools,
  checkMatch,
  randomDraw
} from '@/lib/draw-engine'
import {
  createAdminClient,
  createClient
} from '@/lib/supabase/server'
import type { DrawType } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const {
    drawType = 'random',
    simulate = false,
    drawDate
  } = (await req.json()) as {
    drawType: DrawType
    simulate: boolean
    drawDate: string
  }

  const admin = createAdminClient()

  // Get active users
  const { data: activeSubscriptions, error: subError } = await admin
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (subError) {
    console.error('Subscription fetch error:', subError)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }

  const userIds = activeSubscriptions?.map(s => s.user_id) || []

  // Get scores
  const { data: allScores, error: scoreError } = await admin
    .from('scores')
    .select('*')
    .in('user_id', userIds)

  if (scoreError) {
    console.error('Score fetch error:', scoreError)
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 })
  }

  // Generate draw
  const drawResult =
    drawType === 'algorithmic'
      ? algorithmicDraw(allScores || [])
      : randomDraw()

  // Prize pools
  const { data: subscriptionData } = await admin
    .from('subscriptions')
    .select('amount_cents')
    .eq('status', 'active')

  const avgAmount = subscriptionData?.length
    ? Math.round(
        subscriptionData.reduce((s, sub) => s + sub.amount_cents, 0) /
          subscriptionData.length
      )
    : 999

  const { data: lastDraw } = await admin
    .from('draws')
    .select('rollover_amount_cents, jackpot_rollover')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(1)
    .single()

  const rollover =
    lastDraw?.jackpot_rollover ? lastDraw.rollover_amount_cents : 0

  const pools = calculatePrizePools(userIds.length, avgAmount, rollover)

  // Group scores
  const scoresByUser: Record<string, number[]> = {}

  allScores?.forEach(s => {
    if (!scoresByUser[s.user_id]) {
      scoresByUser[s.user_id] = []
    }
    scoresByUser[s.user_id].push(s.score)
  })

  // Winners
  const match5Winners: string[] = []
  const match4Winners: string[] = []
  const match3Winners: string[] = []

  const winnerMap: Record<
    string,
    { matchType: string; matched: number[]; prize: number }
  > = {}

  Object.entries(scoresByUser).forEach(([userId, userScores]) => {
    const { matchType, matchedNumbers } = checkMatch(
      userScores,
      drawResult.winning_numbers
    )

    if (matchType === 'match_5') match5Winners.push(userId)
    else if (matchType === 'match_4') match4Winners.push(userId)
    else if (matchType === 'match_3') match3Winners.push(userId)

    if (matchType) {
      const prize =
        matchType === 'match_5'
          ? Math.floor(pools.jackpot_5 / Math.max(match5Winners.length, 1))
          : matchType === 'match_4'
          ? Math.floor(pools.match_4 / Math.max(match4Winners.length, 1))
          : Math.floor(pools.match_3 / Math.max(match3Winners.length, 1))

      winnerMap[userId] = {
        matchType,
        matched: matchedNumbers,
        prize
      }
    }
  })

  // Simulation mode
  if (simulate) {
    return NextResponse.json({
      winning_numbers: drawResult.winning_numbers,
      draw_type: drawType,
      winners: {
        match_5: match5Winners.length,
        match_4: match4Winners.length,
        match_3: match3Winners.length
      },
      prize_pools: pools,
      jackpot_rollover: match5Winners.length === 0,
      total_eligible_users: userIds.length
    })
  }

  // Create draw
  const { data: draw, error: drawError } = await admin
    .from('draws')
    .insert({
      draw_date: drawDate || new Date().toISOString().split('T')[0],
      draw_type: drawType,
      winning_numbers: drawResult.winning_numbers,
      status: 'pending',
      jackpot_rollover: match5Winners.length === 0,
      rollover_amount_cents:
        match5Winners.length === 0 ? pools.jackpot_5 : 0,
      created_by: user.id
    })
    .select()
    .single()

  if (drawError || !draw) {
    console.error('Draw creation error:', drawError)
    return NextResponse.json({ error: 'Failed to create draw' }, { status: 500 })
  }

  // Prize pools insert
  await admin.from('prize_pools').insert([
    {
      draw_id: draw.id,
      pool_type: 'jackpot_5',
      total_amount_cents: pools.jackpot_5,
      winners_count: match5Winners.length,
      per_winner_amount_cents: match5Winners.length
        ? Math.floor(pools.jackpot_5 / match5Winners.length)
        : 0
    },
    {
      draw_id: draw.id,
      pool_type: 'match_4',
      total_amount_cents: pools.match_4,
      winners_count: match4Winners.length,
      per_winner_amount_cents: match4Winners.length
        ? Math.floor(pools.match_4 / match4Winners.length)
        : 0
    },
    {
      draw_id: draw.id,
      pool_type: 'match_3',
      total_amount_cents: pools.match_3,
      winners_count: match3Winners.length,
      per_winner_amount_cents: match3Winners.length
        ? Math.floor(pools.match_3 / match3Winners.length)
        : 0
    }
  ])

  // Winners insert
  const winnerInserts = Object.entries(winnerMap).map(
    ([userId, data]) => ({
      draw_id: draw.id,
      user_id: userId,
      match_type: data.matchType,
      matched_numbers: data.matched,
      prize_amount_cents: data.prize,
      payment_status:
        data.matchType === 'match_5'
          ? 'verification_required'
          : 'pending'
    })
  )

  if (winnerInserts.length > 0) {
    await admin.from('winners').insert(winnerInserts)
  }

  return NextResponse.json({
    draw,
    winner_count: winnerInserts.length
  })
}
