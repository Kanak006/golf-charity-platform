// app/error.tsx
'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-white font-display mb-3">Something went wrong</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          An unexpected error occurred. Please try again, or contact support if the issue persists.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={reset} className="btn-primary">Try Again</button>
          <Link href="/" className="btn-secondary">Go Home</Link>
        </div>
        {error.digest && (
          <p className="text-zinc-700 text-xs mt-6 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}