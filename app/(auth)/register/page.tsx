// app/(auth)/register/page.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold text-white font-display">Check your email</h2>
          <p className="text-zinc-400 mt-3">
            We sent a confirmation link to <span className="text-white">{email}</span>.
            Click it to activate your account.
          </p>
          <Link href="/login" className="btn-secondary mt-8 inline-flex">Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-2xl font-bold text-white">
            Golf<span className="text-green-400">forGood</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Create your account</h1>
          <p className="text-zinc-400 mt-2">Join thousands of golfers making a difference</p>
        </div>

        <div className="card">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input"
                placeholder="John Smith"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="text-green-400 hover:text-green-300 transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}