// app/api/profile/route.ts
import {createClient} from '@/lib/supabase/server'
import {NextRequest, NextResponse} from 'next/server'

// GET: current user profile
export async function GET() {
  const supabase = createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const {data, error} =
      await supabase.from('profiles')
          .select(
              '*, charities(id, name, image_url), subscriptions(status, plan, amount_cents, current_period_end)')
          .eq('id', user.id)
          .single()

  if (error) return NextResponse.json({error: error.message}, {status: 500})
  return NextResponse.json(data)
}

// PATCH: update profile fields
export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const body = await req.json()

  // Whitelist updatable fields
  const allowed = [
    'full_name', 'avatar_url', 'selected_charity_id', 'charity_percentage'
  ] const updates: Record<string, any> = {
    updated_at: new Date().toISOString()
  } for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  // Validate charity_percentage
  if ('charity_percentage' in updates && updates.charity_percentage < 10) {
    return NextResponse.json(
        {error: 'Charity percentage must be at least 10'}, {status: 400})
  }

  const {data, error} = await supabase.from('profiles')
                            .update(updates)
                            .eq('id', user.id)
                            .select()
                            .single()

  if (error) return NextResponse.json({error: error.message}, {status: 500})
  return NextResponse.json(data)
}