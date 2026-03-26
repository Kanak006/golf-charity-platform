// app/api/admin/analytics/route.ts
import {createAdminClient, createClient} from '@/lib/supabase/server'
import {NextResponse} from 'next/server'

export async function GET() {
  const supabase = createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const {data: profile} =
      await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json(
      {error: 'Forbidden'}, {status: 403})

  const admin = createAdminClient()

  const [
    usersRes,
    activeSubsRes,
    drawsRes,
    winnersRes,
    charitiesRes,
    contributionsRes,
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('subscriptions').select('id, amount_cents').eq('status', 'active'),
    admin.from('draws').select('id', { count: 'exact', head: true }),
    admin.from('winners').select('prize_amount_cents, payment_status'),
    admin.from('charities').select('id', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('charity_contributions').select('amount_cents'),
  ])

  const totalRevenue =
      activeSubsRes.data?.reduce((s, sub) => s + sub.amount_cents, 0) ?? 0
  const totalPaid = winnersRes.data?.filter(w => w.payment_status === 'paid')
                        .reduce((s, w) => s + w.prize_amount_cents, 0) ??
      0
  const totalPending =
      winnersRes.data
          ?.filter(w => !['paid', 'rejected'].includes(w.payment_status))
          .reduce((s, w) => s + w.prize_amount_cents, 0) ??
      0
  const totalCharityContributions =
      contributionsRes.data?.reduce((s, c) => s + c.amount_cents, 0) ?? 0

  return NextResponse.json({
    total_users: usersRes.count ?? 0,
    active_subscribers: activeSubsRes.data?.length ?? 0,
    total_draws: drawsRes.count ?? 0,
    active_charities: charitiesRes.count ?? 0,
    revenue: {
      monthly_mrr: totalRevenue,
      prize_pool: Math.floor(totalRevenue * 0.5),
      charity_pool: Math.floor(totalRevenue * 0.1),
    },
    payouts: {
      total_paid: totalPaid,
      total_pending: totalPending,
    },
    charity_contributions: totalCharityContributions,
  })
}