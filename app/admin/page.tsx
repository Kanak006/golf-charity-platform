// app/admin/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/draw-engine'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch stats
  const [usersRes, subsRes, drawsRes, winnersRes, charitiesRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('subscriptions').select('id, amount_cents', { count: 'exact' }).eq('status', 'active'),
    supabase.from('draws').select('*').order('draw_date', { ascending: false }).limit(5),
    supabase.from('winners').select('*').eq('payment_status', 'verification_required').limit(10),
    supabase.from('charities').select('id', { count: 'exact' }).eq('is_active', true),
  ])

  const totalRevenue = subsRes.data?.reduce((s, sub) => s + sub.amount_cents, 0) || 0
  const totalPrizePool = Math.floor(totalRevenue * 0.5)
  const totalCharity = Math.floor(totalRevenue * 0.1)

  const stats = [
    { label: 'Total Users', value: usersRes.count || 0, icon: '👥', href: '/admin/users' },
    { label: 'Active Subscribers', value: subsRes.count || 0, icon: '💳', href: '/admin/users' },
    { label: 'Monthly Prize Pool', value: formatCurrency(totalPrizePool), icon: '🏆', href: '/admin/draws' },
    { label: 'Charity Total', value: formatCurrency(totalCharity), icon: '💚', href: '/admin/charities' },
    { label: 'Active Charities', value: charitiesRes.count || 0, icon: '🏛️', href: '/admin/charities' },
    { label: 'Pending Verifications', value: winnersRes.data?.length || 0, icon: '⚠️', href: '/admin/winners' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sidebar + content layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-zinc-900 border-r border-zinc-800 fixed left-0 top-0 bottom-0">
          <div className="p-6 border-b border-zinc-800">
            <Link href="/" className="font-display font-bold text-white text-lg">
              Golf<span className="text-green-400">forGood</span>
            </Link>
            <div className="badge-warning mt-2 text-xs">Admin Panel</div>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { href: '/admin', label: 'Overview', icon: '📊' },
              { href: '/admin/users', label: 'Users', icon: '👥' },
              { href: '/admin/draws', label: 'Draws', icon: '🎯' },
              { href: '/admin/charities', label: 'Charities', icon: '💚' },
              { href: '/admin/winners', label: 'Winners', icon: '🏆' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all text-sm"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-6 left-4 right-4">
            <Link href="/dashboard" className="btn-secondary text-sm w-full justify-center">
              ← User Dashboard
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white font-display">Admin Overview</h1>
            <p className="text-zinc-400 mt-1">Platform-wide statistics and quick actions.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {stats.map(stat => (
              <Link key={stat.label} href={stat.href} className="card-hover">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white font-display">{stat.value}</div>
                <div className="text-zinc-500 text-sm mt-1">{stat.label}</div>
              </Link>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Recent Draws */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Recent Draws</h2>
                <Link href="/admin/draws" className="text-green-400 text-sm hover:text-green-300">
                  Manage →
                </Link>
              </div>
              {drawsRes.data?.length === 0 ? (
                <p className="text-zinc-500 text-sm">No draws yet.</p>
              ) : (
                <div className="space-y-3">
                  {drawsRes.data?.map((draw: any) => (
                    <div key={draw.id} className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-0">
                      <div>
                        <div className="text-white text-sm font-medium">
                          {new Date(draw.draw_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-zinc-500 text-xs flex gap-1 mt-1">
                          {draw.winning_numbers?.map((n: number) => (
                            <span key={n} className="bg-zinc-800 rounded px-1">{n}</span>
                          ))}
                        </div>
                      </div>
                      <span className={draw.status === 'published' ? 'badge-active' : 'badge-warning'}>
                        {draw.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Verifications */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Pending Verifications</h2>
                <Link href="/admin/winners" className="text-green-400 text-sm hover:text-green-300">
                  Manage →
                </Link>
              </div>
              {winnersRes.data?.length === 0 ? (
                <p className="text-zinc-500 text-sm">No pending verifications.</p>
              ) : (
                <div className="space-y-3">
                  {winnersRes.data?.slice(0, 5).map((w: any) => (
                    <div key={w.id} className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-0">
                      <div>
                        <div className="text-white text-sm">{w.match_type.replace('_', ' ')}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">{formatCurrency(w.prize_amount_cents)}</div>
                      </div>
                      <span className="badge-warning">Verify</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}