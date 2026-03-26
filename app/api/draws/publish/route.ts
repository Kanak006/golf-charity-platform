import {createAdminClient, createClient} from '@/lib/supabase/server'
import {NextRequest, NextResponse} from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const {data: profile} =
      await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json(
      {error: 'Forbidden'}, {status: 403})

  const {drawId} = await req.json()
  if (!drawId) return NextResponse.json(
      {error: 'drawId required'}, {status: 400})

  const admin = createAdminClient()
  const {data, error} =
      await admin.from('draws')
          .update({status: 'published', published_at: new Date().toISOString()})
          .eq('id', drawId)
          .select()
          .single()

  if (error) return NextResponse.json({error: error.message}, {status: 500})
  return NextResponse.json(data)
}
