// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-green-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-500 text-sm">Loading…</p>
      </div>
    </div>
  )
}