// app/(dashboard)/dashboard/scores/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Score } from '@/types'

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  const fetchScores = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score_date', { ascending: false })
      .limit(5)
    setScores(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchScores() }, [])

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const scoreNum = parseInt(newScore)
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45 (Stableford format)')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: insertError } = await supabase.from('scores').insert({
      user_id: user.id,
      score: scoreNum,
      score_date: newDate,
    })

    if (insertError) {
      setError('Failed to save score. Please try again.')
    } else {
      setSuccess('Score saved! Your latest 5 scores are shown below.')
      setNewScore('')
      await fetchScores()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('scores').delete().eq('id', id)
    if (!error) fetchScores()
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Back to Dashboard
        </Link>
        <span className="text-white font-semibold">My Scores</span>
        <div />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Score Management</h1>
          <p className="text-zinc-400 mt-2">
            Enter your Stableford scores (1–45). Only your latest 5 scores are kept and used for draws.
          </p>
        </div>

        {/* Add Score Form */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-white mb-6">Add New Score</h2>
          <form onSubmit={handleAddScore} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Stableford Score</label>
                <input
                  type="number"
                  min={1}
                  max={45}
                  value={newScore}
                  onChange={e => setNewScore(e.target.value)}
                  className="input"
                  placeholder="e.g. 36"
                  required
                />
              </div>
              <div>
                <label className="label">Round Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="input"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm">
                {success}
              </div>
            )}

            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              {saving ? 'Saving...' : 'Save Score'}
            </button>
          </form>
        </div>

        {/* Score List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">
              My Last 5 Scores
              <span className="text-zinc-500 text-sm font-normal ml-2">({scores.length}/5)</span>
            </h2>
            {scores.length === 5 && (
              <span className="badge-active">Draw eligible</span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-14 w-full" />)}
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              No scores yet. Add your first round above.
            </div>
          ) : (
            <>
              <div className="flex gap-3 mb-6">
                {scores.map((s, idx) => (
                  <div key={s.id} className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg
                    ${idx === 0 ? 'bg-green-400 text-zinc-900' : 'bg-zinc-800 text-white'}`}>
                    {s.score}
                  </div>
                ))}
                {Array.from({ length: 5 - scores.length }).map((_, i) => (
                  <div key={i} className="w-14 h-14 rounded-full bg-zinc-800/50 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 text-sm">
                    ?
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {scores.map((s, idx) => (
                  <div key={s.id} className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-0">
                    <div className="flex items-center gap-3">
                      {idx === 0 && <span className="text-xs text-green-400 font-medium">Latest</span>}
                      <span className="text-white font-semibold">{s.score} pts</span>
                      <span className="text-zinc-500 text-sm">
                        {new Date(s.score_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-zinc-600 mt-4">
                * Adding a new score automatically removes the oldest if you already have 5.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}