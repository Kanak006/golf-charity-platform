// app/(dashboard)/dashboard/winnings/page.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatCurrency } from '@/lib/draw-engine'

export default function WinningsPage() {
  const [winnings, setWinnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeWinnerId, setActiveWinnerId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchWinnings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('winners')
      .select('*, draws(draw_date, winning_numbers)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setWinnings(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchWinnings() }, [])

  const handleUploadProof = async (winnerId: string, file: File) => {
    setUploading(winnerId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ext = file.name.split('.').pop()
    const path = `proofs/${user.id}/${winnerId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(path, file, { upsert: true })

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('winner-proofs').getPublicUrl(path)
      await supabase.from('winners').update({
        proof_url: urlData.publicUrl,
        payment_status: 'verification_required',
        updated_at: new Date().toISOString(),
      }).eq('id', winnerId)
      fetchWinnings()
    }
    setUploading(null)
  }

  const statusLabel: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'badge-inactive' },
    verification_required: { label: 'Under Review', cls: 'badge-warning' },
    verified: { label: 'Verified', cls: 'badge-active' },
    paid: { label: 'Paid ✓', cls: 'badge-active' },
    rejected: { label: 'Rejected', cls: 'bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-medium' },
  }

  const totalWon = winnings.filter(w => w.payment_status === 'paid').reduce((s, w) => s + w.prize_amount_cents, 0)
  const totalPending = winnings.filter(w => w.payment_status !== 'paid' && w.payment_status !== 'rejected').reduce((s, w) => s + w.prize_amount_cents, 0)

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Back to Dashboard
        </Link>
        <span className="text-white font-semibold">My Winnings</span>
        <div />
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Winnings Overview</h1>
          <p className="text-zinc-400 mt-2">Your draw prizes and payment status.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card">
            <div className="text-zinc-500 text-xs font-medium mb-1">TOTAL PAID OUT</div>
            <div className="text-green-400 text-2xl font-bold font-display">{formatCurrency(totalWon)}</div>
          </div>
          <div className="card">
            <div className="text-zinc-500 text-xs font-medium mb-1">PENDING / IN REVIEW</div>
            <div className="text-amber-400 text-2xl font-bold font-display">{formatCurrency(totalPending)}</div>
          </div>
        </div>

        {/* Winnings List */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">All Prizes</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20" />)}</div>
          ) : winnings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-zinc-400">No winnings yet — your next draw could be the one!</p>
              <Link href="/dashboard/scores" className="btn-primary mt-4 text-sm py-2 inline-flex">
                Enter your scores
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {winnings.map((w: any) => {
                const { label, cls } = statusLabel[w.payment_status] || statusLabel.pending
                return (
                  <div key={w.id} className="border border-zinc-800 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-semibold capitalize">
                          {w.match_type.replace('match_', 'Match ')} Win
                        </div>
                        <div className="text-zinc-500 text-sm mt-0.5">
                          Draw: {new Date(w.draws?.draw_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </div>
                        {w.matched_numbers?.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {w.matched_numbers.map((n: number) => (
                              <span key={n} className="bg-green-400/10 text-green-400 rounded px-2 py-0.5 text-xs font-mono font-bold">{n}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-xl font-display">{formatCurrency(w.prize_amount_cents)}</div>
                        <span className={`${cls} mt-1 inline-flex`}>{label}</span>
                      </div>
                    </div>

                    {/* Proof upload for match_5 */}
                    {w.match_type === 'match_5' && (
                      <div className="mt-4 pt-4 border-t border-zinc-800">
                        {w.proof_url ? (
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400 text-sm">Proof submitted</span>
                            <a href={w.proof_url} target="_blank" rel="noreferrer"
                              className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                              View →
                            </a>
                          </div>
                        ) : (
                          <div>
                            <p className="text-amber-400 text-sm mb-3">
                              ⚠️ Jackpot winners must upload a screenshot of your scores from the golf platform for verification.
                            </p>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (file && activeWinnerId) handleUploadProof(activeWinnerId, file)
                              }}
                            />
                            <button
                              onClick={() => {
                                setActiveWinnerId(w.id)
                                fileInputRef.current?.click()
                              }}
                              disabled={uploading === w.id}
                              className="btn-secondary text-sm py-2"
                            >
                              {uploading === w.id ? 'Uploading...' : '📎 Upload Proof'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}