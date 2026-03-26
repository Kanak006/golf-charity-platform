// app/admin/users/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      subscriptions(status, plan, amount_cents, current_period_end),
      charities(name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-950 flex">
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
            { href: '/admin/users', label: 'Users', icon: '👥', active: true },
            { href: '/admin/draws', label: 'Draws', icon: '🎯' },
            { href: '/admin/charities', label: 'Charities', icon: '💚' },
            { href: '/admin/winners', label: 'Winners', icon: '🏆' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                ${(item as any).active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">User Management</h1>
          <p className="text-zinc-400 mt-1">{users?.length || 0} total users registered.</p>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="text-left py-3 font-medium">User</th>
                <th className="text-left py-3 font-medium">Subscription</th>
                <th className="text-left py-3 font-medium">Plan</th>
                <th className="text-left py-3 font-medium">Charity</th>
                <th className="text-left py-3 font-medium">Role</th>
                <th className="text-left py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u: any) => {
                const sub = u.subscriptions?.[0]
                return (
                  <tr key={u.id} className="table-row">
                    <td className="py-3">
                      <div className="text-white font-medium">{u.full_name || 'No name'}</div>
                      <div className="text-zinc-500 text-xs">{u.email}</div>
                    </td>
                    <td className="py-3">
                      {sub ? (
                        <span className={sub.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                          {sub.status}
                        </span>
                      ) : (
                        <span className="badge-inactive">None</span>
                      )}
                    </td>
                    <td className="py-3 text-zinc-400 capitalize">{sub?.plan || '—'}</td>
                    <td className="py-3 text-zinc-400">{u.charities?.name || '—'}</td>
                    <td className="py-3">
                      <span className={u.role === 'admin' ? 'badge-warning' : 'badge-inactive'}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-500">
                      {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}