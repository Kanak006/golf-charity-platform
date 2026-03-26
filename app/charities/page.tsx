// app/charities/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CharitiesPage() {
  const supabase = createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('*, charity_events(*)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-display font-bold text-white text-lg">
          Golf<span className="text-green-400">forGood</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="nav-link">Sign In</Link>
          <Link href="/subscribe" className="btn-primary text-sm py-2">Subscribe</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white font-display">Our Charity Partners</h1>
          <p className="text-zinc-400 mt-3 text-lg max-w-2xl">
            Choose the cause you care about. A portion of every subscription goes directly to your selected charity, every month.
          </p>
        </div>

        {/* Featured */}
        {charities?.filter(c => c.is_featured).length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-medium text-green-400 uppercase tracking-wider mb-6">Featured Charity</h2>
            {charities?.filter(c => c.is_featured).slice(0, 1).map((c: any) => (
              <div key={c.id} className="card bg-gradient-to-br from-green-950/30 to-zinc-900 border-green-900/40 md:flex gap-8 items-start">
                {c.image_url && (
                  <img src={c.image_url} alt={c.name} className="w-full md:w-64 h-48 object-cover rounded-xl shrink-0" />
                )}
                <div>
                  <div className="badge-active mb-3 inline-flex">⭐ Featured</div>
                  <h3 className="text-2xl font-bold text-white font-display">{c.name}</h3>
                  <p className="text-zinc-300 mt-3 leading-relaxed">{c.description}</p>
                  {c.website_url && (
                    <a href={c.website_url} target="_blank" rel="noreferrer"
                      className="btn-secondary mt-4 text-sm inline-flex">
                      Visit Website →
                    </a>
                  )}
                  {c.charity_events?.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs text-zinc-500 font-medium mb-2">UPCOMING EVENTS</div>
                      {c.charity_events.slice(0, 2).map((ev: any) => (
                        <div key={ev.id} className="text-sm text-zinc-400">
                          📅 {ev.title} — {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-GB') : 'TBC'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Charities */}
        <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-6">All Charities</h2>
        {charities?.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <div className="text-4xl mb-4">💚</div>
            <p>Charity partners coming soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities?.map((c: any) => (
              <div key={c.id} className="card-hover">
                {c.image_url && (
                  <img src={c.image_url} alt={c.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold text-lg">{c.name}</h3>
                  {c.is_featured && <span className="badge-active text-xs">Featured</span>}
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">{c.description}</p>

                {c.charity_events?.length > 0 && (
                  <div className="mt-4 p-3 bg-zinc-800 rounded-xl">
                    <div className="text-xs text-zinc-500 font-medium mb-1">NEXT EVENT</div>
                    <div className="text-sm text-white">{c.charity_events[0].title}</div>
                    {c.charity_events[0].event_date && (
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {new Date(c.charity_events[0].event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                )}

                {c.website_url && (
                  <a href={c.website_url} target="_blank" rel="noreferrer"
                    className="mt-4 text-green-400 hover:text-green-300 text-sm transition-colors inline-flex items-center gap-1">
                    Visit website →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white font-display">Ready to support a cause?</h2>
          <p className="text-zinc-400 mt-2">Subscribe and choose your charity at signup.</p>
          <Link href="/subscribe" className="btn-primary mt-6 text-base px-8 py-4">
            Start Your Membership →
          </Link>
        </div>
      </div>
    </div>
  )
}