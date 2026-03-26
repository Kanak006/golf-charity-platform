// app/page.tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(3)

  const { data: latestDraw } = await supabase
    .from('draws')
    .select('*, prize_pools(*)')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-white">
            Golf<span className="text-green-400">forGood</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/charities" className="nav-link">Charities</Link>
            <Link href="/draws" className="nav-link">Draws</Link>
            <Link href="/login" className="nav-link">Sign In</Link>
            <Link href="/subscribe" className="btn-primary text-sm py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/30 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-green-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="badge-active inline-flex mb-6">
              ✦ Every round makes a difference
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
              Play your best.{' '}
              <span className="text-green-400">Win big.</span>{' '}
              Give back.
            </h1>
            <p className="mt-6 text-xl text-zinc-400 leading-relaxed max-w-2xl">
              A subscription golf platform where your Stableford scores enter you into monthly prize draws — 
              while supporting the charity you care about most.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/subscribe" className="btn-primary text-base px-8 py-4">
                Start Your Membership →
              </Link>
              <Link href="/draws" className="btn-secondary text-base px-8 py-4">
                See Latest Draw
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-heading">How it works</h2>
            <p className="section-sub">Three simple steps to play, win, and give.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '⛳',
                title: 'Subscribe & Play',
                desc: 'Choose a monthly or yearly plan. Enter your 5 latest Stableford scores any time.',
              },
              {
                step: '02',
                icon: '🎯',
                title: 'Enter the Draw',
                desc: 'Your scores automatically enter you into the monthly prize draw. 3, 4, or 5 matching numbers wins.',
              },
              {
                step: '03',
                icon: '💚',
                title: 'Give Back',
                desc: 'At least 10% of your subscription goes directly to your chosen charity. Every month.',
              },
            ].map((item) => (
              <div key={item.step} className="card relative overflow-hidden group">
                <div className="text-6xl font-bold text-zinc-800 absolute top-4 right-6 font-display">
                  {item.step}
                </div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="section-heading">Monthly prize pools</h2>
              <p className="section-sub">
                A share of every subscription builds the prize pool. Match your scores to win.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { label: '5 Number Match', pct: '40%', color: 'text-amber-400', note: 'Jackpot — rolls over if unclaimed' },
                  { label: '4 Number Match', pct: '35%', color: 'text-green-400', note: 'Split equally among winners' },
                  { label: '3 Number Match', pct: '25%', color: 'text-blue-400', note: 'Split equally among winners' },
                ].map((tier) => (
                  <div key={tier.label} className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                    <div className={`text-2xl font-bold font-display ${tier.color} w-16 shrink-0`}>{tier.pct}</div>
                    <div>
                      <div className="font-semibold text-white">{tier.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{tier.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card bg-gradient-to-br from-green-950/40 to-zinc-900 border-green-900/40">
              <div className="text-sm text-green-400 font-medium mb-2">Latest draw results</div>
              {latestDraw ? (
                <>
                  <div className="text-zinc-400 text-sm mb-4">
                    {new Date(latestDraw.draw_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {latestDraw.winning_numbers.map((n: number) => (
                      <div key={n} className="w-12 h-12 rounded-full bg-green-400 text-zinc-900 font-bold text-lg flex items-center justify-center">
                        {n}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-zinc-400">First draw coming soon!</p>
              )}
              <Link href="/draws" className="btn-secondary mt-6 text-sm">
                View all draws →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Charity Section */}
      <section className="py-24 px-6 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-heading">Choose your cause</h2>
            <p className="section-sub">
              Every membership supports a charity you select. At least 10% of your subscription, every month.
            </p>
          </div>
          {charities && charities.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {charities.map((c: any) => (
                <Link key={c.id} href="/charities" className="card-hover group">
                  {c.image_url && (
                    <img src={c.image_url} alt={c.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                  )}
                  <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">{c.name}</h3>
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{c.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-zinc-500">Charities coming soon.</div>
          )}
          <div className="text-center mt-10">
            <Link href="/charities" className="btn-secondary">Browse all charities →</Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-heading">Simple, transparent pricing</h2>
          <p className="section-sub">One membership. Full access. Real impact.</p>
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {/* Monthly */}
            <div className="card text-left">
              <div className="text-zinc-400 text-sm font-medium mb-2">Monthly</div>
              <div className="text-4xl font-bold text-white font-display">
                £9.99 <span className="text-xl text-zinc-500 font-normal">/mo</span>
              </div>
              <ul className="mt-6 space-y-3 text-zinc-400 text-sm">
                {['Monthly draw entry', 'Score tracking (5 scores)', 'Charity contribution', 'Winner verification'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/subscribe?plan=monthly" className="btn-secondary w-full justify-center mt-8">
                Get started
              </Link>
            </div>
            {/* Yearly */}
            <div className="card text-left border-green-900/60 bg-gradient-to-br from-green-950/20 to-zinc-900 relative">
              <div className="absolute top-4 right-4 badge-active text-xs">Save 25%</div>
              <div className="text-green-400 text-sm font-medium mb-2">Yearly</div>
              <div className="text-4xl font-bold text-white font-display">
                £89.99 <span className="text-xl text-zinc-500 font-normal">/yr</span>
              </div>
              <ul className="mt-6 space-y-3 text-zinc-400 text-sm">
                {['Monthly draw entry', 'Score tracking (5 scores)', 'Charity contribution', 'Winner verification', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/subscribe?plan=yearly" className="btn-primary w-full justify-center mt-8">
                Get started →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm">
          <div className="font-display font-bold text-white text-lg">
            Golf<span className="text-green-400">forGood</span>
          </div>
          <div className="flex gap-6">
            <Link href="/charities" className="hover:text-white transition-colors">Charities</Link>
            <Link href="/draws" className="hover:text-white transition-colors">Draws</Link>
            <Link href="/subscribe" className="hover:text-white transition-colors">Subscribe</Link>
          </div>
          <div>© {new Date().getFullYear()} GolfforGood. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}