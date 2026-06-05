import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface SaveRequest {
  recipe: string
  targetDate: string
  targetTime: string
  steps: unknown[]
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: SaveRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { recipe, targetDate, targetTime, steps } = body

  if (!recipe || !targetDate || !targetTime || !steps) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await supabase.from('bake_schedules').insert({
    user_id: user.id,
    recipe_name: recipe,
    target_date: targetDate,
    target_time: targetTime,
    target_ready_at: new Date(`${targetDate}T${targetTime}`).toISOString(),
    steps,
    completed: false,
  })

  if (error) {
    console.error('[bake-schedule/save] insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
