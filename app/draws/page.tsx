// app/draws/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/draw-engine'

export default async function DrawsPage() {
  const supabase = createClient()
  const { data: draws } = await supabase
    .from('draws')
    .select('*, prize_pools(*)')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-display font-bold text-white text-lg">
          Golf<span className="text-green-400">forGood</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="nav-link">Sign In</Link>
          <Link href="/subscribe" className="btn-primary text-sm py-2">Subscribe</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white font-display">Draw Results</h1>
          <p className="text-zinc-400 mt-3 text-lg">
            Monthly draws run on the 1st of each month. Match 3, 4, or 5 of your Stableford scores to win.
          </p>
        </div>

        {/* How draws work */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { match: '5 numbers', share: '40% of pool', color: 'text-amber-400', note: 'Jackpot — rolls over' },
            { match: '4 numbers', share: '35% of pool', color: 'text-green-400', note: 'Split among winners' },
            { match: '3 numbers', share: '25% of pool', color: 'text-blue-400', note: 'Split among winners' },
          ].map(t => (
            <div key={t.match} className="card text-center">
              <div className={`text-lg font-bold font-display ${t.color}`}>{t.share}</div>
              <div className="text-white text-sm font-medium mt-1">{t.match}</div>
              <div className="text-zinc-500 text-xs mt-1">{t.note}</div>
            </div>
          ))}
        </div>

        {/* Draw results */}
        {draws?.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-white">First draw coming soon</h2>
            <p className="text-zinc-400 mt-2">Subscribe now to be eligible for the first draw.</p>
            <Link href="/subscribe" className="btn-primary mt-6 inline-flex">Subscribe →</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {draws?.map((draw: any, idx: number) => {
              const totalPool = draw.prize_pools?.reduce((s: number, p: any) => s + p.total_amount_cents, 0) || 0
              const isLatest = idx === 0
              return (
                <div key={draw.id} className={`card ${isLatest ? 'border-green-900/40 bg-gradient-to-br from-green-950/20 to-zinc-900' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {isLatest && <div className="badge-active text-xs mb-2 inline-flex">Latest Draw</div>}
                      <h2 className="text-xl font-bold text-white font-display">
                        {new Date(draw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </h2>
                      <div className="text-zinc-500 text-sm mt-0.5 capitalize">{draw.draw_type} draw</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-xl font-display">{formatCurrency(totalPool)}</div>
                      <div className="text-zinc-500 text-xs">Total prize pool</div>
                    </div>
                  </div>

                  {/* Winning numbers */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-zinc-500 text-sm mr-2">Winning numbers:</span>
                    {draw.winning_numbers?.map((n: number) => (
                      <div key={n}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                          ${isLatest ? 'bg-green-400 text-zinc-900' : 'bg-zinc-800 text-white'}`}>
                        {n}
                      </div>
                    ))}
                    {draw.jackpot_rollover && (
                      <span className="ml-2 text-amber-400 text-xs">⚡ Jackpot rolled over</span>
                    )}
                  </div>

                  {/* Pool breakdown */}
                  {draw.prize_pools?.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {draw.prize_pools.map((pool: any) => (
                        <div key={pool.id} className="bg-zinc-900 rounded-xl p-3 text-center">
                          <div className="text-zinc-500 text-xs mb-1 capitalize">
                            {pool.pool_type.replace(/_/g, ' ')}
                          </div>
                          <div className="text-white font-bold">{formatCurrency(pool.total_amount_cents)}</div>
                          <div className="text-zinc-600 text-xs mt-0.5">
                            {pool.winners_count} winner{pool.winners_count !== 1 ? 's' : ''}
                            {pool.winners_count > 0 && pool.per_winner_amount_cents > 0 &&
                              ` · ${formatCurrency(pool.per_winner_amount_cents)} ea`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}