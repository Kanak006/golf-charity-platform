// app/admin/winners/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatCurrency } from '@/lib/draw-engine'

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const supabase = createClient()

  const fetchWinners = async () => {
    let query = supabase
      .from('winners')
      .select(`
        *,
        profiles(full_name, email),
        draws(draw_date, winning_numbers)
      `)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('payment_status', filter)
    }

    const { data } = await query
    setWinners(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchWinners() }, [filter])

  const handleUpdateStatus = async (winnerId: string, status: string) => {
    await supabase.from('winners').update({
      payment_status: status,
      updated_at: new Date().toISOString(),
    }).eq('id', winnerId)
    fetchWinners()
  }

  const statusColors: Record<string, string> = {
    pending: 'badge-inactive',
    verification_required: 'badge-warning',
    verified: 'badge-active',
    paid: 'badge-active',
    rejected: 'bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-medium',
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <aside className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 fixed left-0 top-0 bottom-0">
        <div className="p-6 border-b border-zinc-800">
          <Link href="/" className="font-display font-bold text-white text-lg">
            Golf<span className="text-green-400">forGood</span>
          </Link>
          <div className="badge-warning mt-2 text-xs">Admin Panel</div>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { href: '/admin', label: 'Overview', icon: '📊' },
            { href: '/admin/users', label: 'Users', icon: '👥' },
            { href: '/admin/draws', label: 'Draws', icon: '🎯' },
            { href: '/admin/charities', label: 'Charities', icon: '💚' },
            { href: '/admin/winners', label: 'Winners', icon: '🏆', active: true },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                ${(item as any).active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Winners & Verification</h1>
          <p className="text-zinc-400 mt-1">Review winner submissions and manage payouts.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'verification_required', 'verified', 'paid', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                filter === f
                  ? 'bg-green-400 text-zinc-900 font-medium'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="card overflow-x-auto">
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16" />)}</div>
          ) : winners.length === 0 ? (
            <p className="text-zinc-500 py-8 text-center">No winners found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="text-left py-3 font-medium">Winner</th>
                  <th className="text-left py-3 font-medium">Draw</th>
                  <th className="text-left py-3 font-medium">Match</th>
                  <th className="text-left py-3 font-medium">Prize</th>
                  <th className="text-left py-3 font-medium">Proof</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((w: any) => (
                  <tr key={w.id} className="table-row">
                    <td className="py-3">
                      <div className="text-white">{w.profiles?.full_name || 'Unknown'}</div>
                      <div className="text-zinc-500 text-xs">{w.profiles?.email}</div>
                    </td>
                    <td className="py-3 text-zinc-400">
                      {new Date(w.draws?.draw_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3">
                      <span className="text-white capitalize">{w.match_type.replace('_', ' ')}</span>
                      <div className="flex gap-1 mt-1">
                        {w.matched_numbers?.map((n: number) => (
                          <span key={n} className="bg-green-400/10 text-green-400 rounded px-1 text-xs">{n}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-green-400 font-bold">{formatCurrency(w.prize_amount_cents)}</td>
                    <td className="py-3">
                      {w.proof_url ? (
                        <a href={w.proof_url} target="_blank" rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs underline">
                          View proof
                        </a>
                      ) : (
                        <span className="text-zinc-600 text-xs">No proof yet</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={statusColors[w.payment_status] || 'badge-inactive'}>
                        {w.payment_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {w.payment_status === 'verification_required' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(w.id, 'verified')}
                              className="text-green-400 hover:text-green-300 text-xs border border-green-400/30 rounded px-2 py-1 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(w.id, 'rejected')}
                              className="text-red-400 hover:text-red-300 text-xs border border-red-400/30 rounded px-2 py-1 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {w.payment_status === 'verified' && (
                          <button
                            onClick={() => handleUpdateStatus(w.id, 'paid')}
                            className="text-amber-400 hover:text-amber-300 text-xs border border-amber-400/30 rounded px-2 py-1 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}