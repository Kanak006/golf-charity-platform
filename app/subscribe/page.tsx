// app/subscribe/page.tsx
'use client'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SubscribePage() {
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get('plan') || 'yearly'
  const [plan, setPlan] = useState<'monthly' | 'yearly'>(initialPlan as any)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/subscriptions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })

    if (res.status === 401) {
      router.push(`/register?redirect=/subscribe?plan=${plan}`)
      return
    }

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-2xl font-bold text-white">
            Golf<span className="text-green-400">forGood</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mt-6 font-display">Choose your plan</h1>
          <p className="text-zinc-400 mt-2">Start entering draws and supporting charity today.</p>
        </div>

        {/* Plan Selector */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { key: 'monthly', price: '£9.99', period: '/month', label: 'Monthly' },
            { key: 'yearly', price: '£89.99', period: '/year', label: 'Yearly', badge: 'Save 25%' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setPlan(p.key as any)}
              className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                plan === p.key
                  ? 'border-green-400 bg-green-400/5'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              {p.badge && (
                <span className="absolute top-3 right-3 badge-active text-xs">{p.badge}</span>
              )}
              <div className="text-zinc-400 text-sm mb-1">{p.label}</div>
              <div className="text-white font-bold text-2xl font-display">{p.price}</div>
              <div className="text-zinc-500 text-xs">{p.period}</div>
              {plan === p.key && (
                <div className="mt-3 text-green-400 text-xs font-medium">✓ Selected</div>
              )}
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="card mb-6">
          <ul className="space-y-3 text-sm text-zinc-300">
            {[
              '✓ Monthly Stableford draw entry',
              '✓ Track your latest 5 golf scores',
              '✓ Support your chosen charity (10%+)',
              '✓ Win jackpot, 4-match, or 3-match prizes',
              '✓ Winner verification & fast payouts',
              '✓ Cancel or manage billing anytime',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">{f}</li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <button onClick={handleSubscribe} disabled={loading} className="btn-primary w-full justify-center py-4 text-base">
          {loading ? 'Redirecting to checkout...' : `Subscribe — ${plan === 'monthly' ? '£9.99/mo' : '£89.99/yr'}`}
        </button>

        <p className="text-zinc-600 text-xs text-center mt-4">
          Powered by Stripe. Secure payment. Cancel anytime.
        </p>

        <div className="text-center mt-4">
          <Link href="/" className="text-zinc-500 text-sm hover:text-zinc-400 transition-colors">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}