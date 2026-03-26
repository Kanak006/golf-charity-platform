// app/admin/charities/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', image_url: '', website_url: '', is_featured: false
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchCharities = async () => {
    const { data, error } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
    console.log("DATA:", data);
    console.log("ERROR:", error);
    setCharities(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCharities() }, [])

  const openEdit = (c: any) => {
    setEditing(c)
    setForm({ name: c.name, description: c.description || '', image_url: c.image_url || '', website_url: c.website_url || '', is_featured: c.is_featured })
    setShowForm(true)
  }

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', description: '', image_url: '', website_url: '', is_featured: false })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    if (editing) {
      await supabase.from('charities').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id)
    } else {
      await supabase.from('charities').insert(form)
    }
    setSaving(false)
    setShowForm(false)
    fetchCharities()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('charities').update({ is_active: !current }).eq('id', id)
    fetchCharities()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this charity?')) return
    await supabase.from('charities').delete().eq('id', id)
    fetchCharities()
  }

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
            { href: '/admin/users', label: 'Users', icon: '👥' },
            { href: '/admin/draws', label: 'Draws', icon: '🎯' },
            { href: '/admin/charities', label: 'Charities', icon: '💚', active: true },
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white font-display">Charity Management</h1>
            <p className="text-zinc-400 mt-1">{charities.length} charities listed.</p>
          </div>
          <button onClick={openNew} className="btn-primary">+ Add Charity</button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card mb-8 border-green-900/40">
            <h2 className="text-lg font-semibold text-white mb-6">{editing ? 'Edit Charity' : 'Add New Charity'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Charity Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input" required placeholder="e.g. Cancer Research UK" />
                </div>
                <div>
                  <label className="label">Website URL</label>
                  <input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
                    className="input" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input min-h-[80px] resize-none" placeholder="Brief description of the charity..." />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  className="input" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={form.is_featured}
                  onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                  className="w-4 h-4 rounded" />
                <label htmlFor="featured" className="text-zinc-300 text-sm">Feature on homepage</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Charity'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Charities List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton h-48" />)
          ) : charities.map((c: any) => (
            <div key={c.id} className={`card ${!c.is_active ? 'opacity-50' : ''}`}>
              {c.image_url && (
                <img src={c.image_url} alt={c.name} className="w-full h-32 object-cover rounded-xl mb-3" />
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold">{c.name}</h3>
                <div className="flex gap-1">
                  {c.is_featured && <span className="badge-warning text-xs">Featured</span>}
                  <span className={c.is_active ? 'badge-active text-xs' : 'badge-inactive text-xs'}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{c.description}</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => openEdit(c)} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">Edit</button>
                <button onClick={() => toggleActive(c.id, c.is_active)} className="text-amber-400 hover:text-amber-300 text-xs transition-colors">
                  {c.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}