// app/admin/loading.tsx
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <div className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800" />
      <main className="ml-64 flex-1 p-8">
        <div className="skeleton h-8 w-48 rounded mb-2" />
        <div className="skeleton h-4 w-64 rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-8 w-8 rounded mb-2" />
              <div className="skeleton h-7 w-20 rounded mb-1" />
              <div className="skeleton h-3 w-28 rounded" />
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {[1,2].map(i => (
            <div key={i} className="card">
              <div className="skeleton h-5 w-32 rounded mb-6" />
              {[1,2,3,4].map(j => (
                <div key={j} className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-0">
                  <div>
                    <div className="skeleton h-4 w-32 rounded mb-1" />
                    <div className="skeleton h-3 w-20 rounded" />
                  </div>
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}