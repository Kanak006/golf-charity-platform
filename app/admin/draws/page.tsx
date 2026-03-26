// app/admin/draws/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatCurrency } from '@/lib/draw-engine'

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState<any>(null)
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0])
  const [message, setMessage] = useState('')

  const supabase = createClient()

  const fetchDraws = async () => {
    const { data } = await supabase
      .from('draws')
      .select('*, prize_pools(*)')
      .order('draw_date', { ascending: false })
      .limit(20)
    setDraws(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchDraws() }, [])

  const handleSimulate = async () => {
    setSimulating(true)
    setSimResult(null)
    const res = await fetch('/api/draws/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawType, simulate: true, drawDate }),
    })
    const data = await res.json()
    setSimResult(data)
    setSimulating(false)
  }

  const handleRunDraw = async () => {
    if (!confirm('Run and save this draw? This cannot be undone.')) return
    setRunning(true)
    setMessage('')
    const res = await fetch('/api/draws/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawType, simulate: false, drawDate }),
    })
    const data = await res.json()
    if (data.draw) {
      setMessage(`Draw created successfully! ${data.winner_count} winner(s) found.`)
      fetchDraws()
    } else {
      setMessage('Error running draw. Please try again.')
    }
    setRunning(false)
  }

  const handlePublish = async (drawId: string) => {
    await supabase.from('draws').update({
      status: 'published',
      published_at: new Date().toISOString(),
    }).eq('id', drawId)
    fetchDraws()
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
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
            { href: '/admin/draws', label: 'Draws', icon: '🎯', active: true },
            { href: '/admin/charities', label: 'Charities', icon: '💚' },
            { href: '/admin/winners', label: 'Winners', icon: '🏆' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                ${item.active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Draw Management</h1>
          <p className="text-zinc-400 mt-1">Configure, simulate, and publish monthly draws.</p>
        </div>

        {/* Draw Config */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-white mb-6">Run New Draw</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="label">Draw Type</label>
              <select
                value={drawType}
                onChange={e => setDrawType(e.target.value as any)}
                className="input"
              >
                <option value="random">Random (lottery-style)</option>
                <option value="algorithmic">Algorithmic (weighted by scores)</option>
              </select>
            </div>
            <div>
              <label className="label">Draw Date</label>
              <input type="date" value={drawDate} onChange={e => setDrawDate(e.target.value)} className="input" />
            </div>
            <div className="flex items-end gap-3">
              <button onClick={handleSimulate} disabled={simulating} className="btn-secondary flex-1 justify-center">
                {simulating ? 'Simulating...' : '🔍 Simulate'}
              </button>
              <button onClick={handleRunDraw} disabled={running} className="btn-primary flex-1 justify-center">
                {running ? 'Running...' : '▶ Run Draw'}
              </button>
            </div>
          </div>

          {message && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm">{message}</div>
          )}

          {/* Simulation Result */}
          {simResult && (
            <div className="mt-6 p-4 bg-zinc-800 rounded-xl">
              <div className="text-white font-semibold mb-3">📊 Simulation Result</div>
              <div className="flex gap-3 mb-4">
                {simResult.winning_numbers?.map((n: number) => (
                  <div key={n} className="w-10 h-10 rounded-full bg-amber-400 text-zinc-900 font-bold flex items-center justify-center">
                    {n}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-zinc-900 rounded-lg p-3">
                  <div className="text-amber-400 font-bold text-lg">{simResult.winners?.match_5}</div>
                  <div className="text-zinc-400">5-match winners</div>
                </div>
                <div className="bg-zinc-900 rounded-lg p-3">
                  <div className="text-green-400 font-bold text-lg">{simResult.winners?.match_4}</div>
                  <div className="text-zinc-400">4-match winners</div>
                </div>
                <div className="bg-zinc-900 rounded-lg p-3">
                  <div className="text-blue-400 font-bold text-lg">{simResult.winners?.match_3}</div>
                  <div className="text-zinc-400">3-match winners</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-zinc-400">
                Total eligible users: <span className="text-white">{simResult.total_eligible_users}</span>
                {simResult.jackpot_rollover && (
                  <span className="ml-4 text-amber-400">⚡ Jackpot will roll over</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Draws List */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">All Draws</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16" />)}</div>
          ) : draws.length === 0 ? (
            <p className="text-zinc-500">No draws yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left py-3 font-medium">Date</th>
                    <th className="text-left py-3 font-medium">Winning Numbers</th>
                    <th className="text-left py-3 font-medium">Type</th>
                    <th className="text-left py-3 font-medium">Pool</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {draws.map((draw: any) => {
                    const totalPool = draw.prize_pools?.reduce((s: number, p: any) => s + p.total_amount_cents, 0) || 0
                    return (
                      <tr key={draw.id} className="table-row">
                        <td className="py-3 text-white">
                          {new Date(draw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            {draw.winning_numbers?.map((n: number) => (
                              <span key={n} className="bg-zinc-800 text-white rounded px-2 py-0.5 font-mono">{n}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 text-zinc-400 capitalize">{draw.draw_type}</td>
                        <td className="py-3 text-green-400">{formatCurrency(totalPool)}</td>
                        <td className="py-3">
                          <span className={draw.status === 'published' ? 'badge-active' : draw.status === 'simulated' ? 'badge-warning' : 'badge-inactive'}>
                            {draw.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {draw.status !== 'published' && (
                            <button
                              onClick={() => handlePublish(draw.id)}
                              className="text-green-400 hover:text-green-300 text-sm transition-colors"
                            >
                              Publish
                            </button>
                          )}
                          {draw.jackpot_rollover && (
                            <span className="ml-3 text-amber-400 text-xs">Jackpot rollover</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}