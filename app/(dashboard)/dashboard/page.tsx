// app/(dashboard)/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/draw-engine'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all user data in parallel
  const [profileRes, subscriptionRes, scoresRes, winningsRes] = await Promise.all([
    supabase.from('profiles').select('*, charities(name)').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
    supabase.from('scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(5),
    supabase.from('winners').select('*, draws(draw_date, winning_numbers)').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const profile = profileRes.data
  const subscription = subscriptionRes.data
  const scores = scoresRes.data || []
  const winnings = winningsRes.data || []

  const totalWon = winnings.reduce((sum: number, w: any) => sum + w.prize_amount_cents, 0)

  // Next draw date (1st of next month)
  const now = new Date()
  const nextDraw = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navbar */}
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-display font-bold text-white text-lg">
          Golf<span className="text-green-400">forGood</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-sm">{profile?.full_name || user.email}</span>
          <form action="/api/auth/signout" method="post">
            <button className="text-zinc-500 hover:text-white text-sm transition-colors">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'} 👋
          </h1>
          <p className="text-zinc-400 mt-1">Here's your membership overview.</p>
        </div>

        {/* Status row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="text-zinc-500 text-xs font-medium mb-1">MEMBERSHIP</div>
            {subscription ? (
              <span className="badge-active">Active</span>
            ) : (
              <span className="badge-inactive">Inactive</span>
            )}
            {subscription && (
              <div className="text-zinc-500 text-xs mt-2">
                Renews {new Date(subscription.current_period_end!).toLocaleDateString('en-GB')}
              </div>
            )}
          </div>

          <div className="card">
            <div className="text-zinc-500 text-xs font-medium mb-1">CHARITY</div>
            <div className="text-white font-medium text-sm">
              {(profile as any)?.charities?.name || 'None selected'}
            </div>
            <div className="text-zinc-500 text-xs mt-1">{profile?.charity_percentage}% contribution</div>
          </div>

          <div className="card">
            <div className="text-zinc-500 text-xs font-medium mb-1">NEXT DRAW</div>
            <div className="text-white font-medium">
              {nextDraw.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
            <div className="text-zinc-500 text-xs mt-1">{scores.length}/5 scores entered</div>
          </div>

          <div className="card">
            <div className="text-zinc-500 text-xs font-medium mb-1">TOTAL WON</div>
            <div className="text-green-400 font-bold text-xl font-display">
              {formatCurrency(totalWon)}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Score Entry */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">My Scores</h2>
              <Link href="/dashboard/scores" className="text-green-400 text-sm hover:text-green-300 transition-colors">
                Manage →
              </Link>
            </div>
            {scores.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">⛳</div>
                <p className="text-zinc-400 text-sm">No scores yet.</p>
                <Link href="/dashboard/scores" className="btn-primary mt-4 text-sm py-2">
                  Enter your first score
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((s: any) => (
                  <div key={s.id} className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-0">
                    <div>
                      <div className="text-white font-medium">{s.score} pts</div>
                      <div className="text-zinc-500 text-xs">
                        {new Date(s.score_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-green-400 font-bold">
                      {s.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Winnings */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Winnings</h2>
              <Link href="/dashboard/winnings" className="text-green-400 text-sm hover:text-green-300 transition-colors">
                View all →
              </Link>
            </div>
            {winnings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🏆</div>
                <p className="text-zinc-400 text-sm">No winnings yet — keep playing!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {winnings.slice(0, 4).map((w: any) => (
                  <div key={w.id} className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-0">
                    <div>
                      <div className="text-white font-medium">{w.match_type.replace('_', ' ').replace('match', 'Match')}</div>
                      <div className="text-zinc-500 text-xs">
                        {new Date(w.draws?.draw_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">{formatCurrency(w.prize_amount_cents)}</div>
                      <span className={`text-xs ${w.payment_status === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                        {w.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* No subscription CTA */}
        {!subscription && (
          <div className="mt-8 card bg-gradient-to-br from-green-950/40 to-zinc-900 border-green-900/40 text-center py-10">
            <h3 className="text-xl font-semibold text-white mb-2">No active membership</h3>
            <p className="text-zinc-400 mb-6">Subscribe to enter monthly draws and support your chosen charity.</p>
            <Link href="/subscribe" className="btn-primary">Start your membership →</Link>
          </div>
        )}
      </div>
    </div>
  )
}