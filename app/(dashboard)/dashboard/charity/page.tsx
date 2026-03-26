// app/(dashboard)/dashboard/charity/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CharitySelectionPage() {
  const [charities, setCharities] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [percentage, setPercentage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [charitiesRes, profileRes] = await Promise.all([
        supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false }),
        supabase.from('profiles').select('selected_charity_id, charity_percentage').eq('id', user.id).single(),
      ])

      setCharities(charitiesRes.data || [])
      setSelected(profileRes.data?.selected_charity_id || null)
      setPercentage(profileRes.data?.charity_percentage || 10)
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      selected_charity_id: selected,
      charity_percentage: percentage,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
    setSaving(false)
    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Back to Dashboard
        </Link>
        <span className="text-white font-semibold">My Charity</span>
        <div />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Choose Your Charity</h1>
          <p className="text-zinc-400 mt-2">
            Select the cause your subscription supports. Minimum 10% of your subscription fee.
          </p>
        </div>

        {/* Contribution Percentage */}
        <div className="card mb-6">
          <label className="label">Charity Contribution Percentage</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={10}
              max={100}
              value={percentage}
              onChange={e => setPercentage(parseInt(e.target.value))}
              className="flex-1 accent-green-400"
            />
            <span className="text-green-400 font-bold text-xl w-16 text-right font-display">{percentage}%</span>
          </div>
          <p className="text-zinc-500 text-xs mt-2">
            Minimum is 10%. You can optionally increase this to give more.
          </p>
        </div>

        {/* Charity Grid */}
        <div className="space-y-3 mb-6">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton h-20" />)
          ) : charities.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4
                ${selected === c.id
                  ? 'border-green-400 bg-green-400/5'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}
            >
              {c.image_url && (
                <img src={c.image_url} alt={c.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{c.name}</span>
                  {c.is_featured && <span className="badge-active text-xs">Featured</span>}
                </div>
                <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{c.description}</p>
              </div>
              {selected === c.id && (
                <div className="text-green-400 text-xl shrink-0">✓</div>
              )}
            </button>
          ))}
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm mb-4">
            ✓ Your charity selection has been saved.
          </div>
        )}

        <button onClick={handleSave} disabled={saving || !selected} className="btn-primary w-full justify-center py-4">
          {saving ? 'Saving...' : 'Save Charity Selection'}
        </button>
      </div>
    </div>
  )
}