// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-display text-[120px] font-bold text-zinc-900 leading-none select-none">
          404
        </div>
        <h1 className="text-3xl font-bold text-white font-display -mt-4 mb-3">Page not found</h1>
        <p className="text-zinc-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
        </div>
      </div>
    </div>
  )
}