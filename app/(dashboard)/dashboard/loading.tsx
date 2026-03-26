// app/(dashboard)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="h-16 bg-zinc-900 border-b border-zinc-800" />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="skeleton h-8 w-64 rounded mb-2" />
        <div className="skeleton h-4 w-40 rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-3 w-20 rounded mb-3" />
              <div className="skeleton h-6 w-16 rounded mb-1" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {[1,2].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-32 rounded mb-6" />
              {[1,2,3].map(j => (
                <div key={j} className="flex justify-between py-3 border-b border-zinc-800 last:border-0">
                  <div className="skeleton h-4 w-24 rounded" />
                  <div className="skeleton h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}