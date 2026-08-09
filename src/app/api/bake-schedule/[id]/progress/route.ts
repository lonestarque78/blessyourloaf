import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ProgressRequest {
  stepIndex: number
  action: 'start' | 'complete' | 'reopen'
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: ProgressRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { stepIndex, action } = body
  if (
    typeof stepIndex !== 'number' ||
    !Number.isInteger(stepIndex) ||
    stepIndex < 0 ||
    !['start', 'complete', 'reopen'].includes(action)
  ) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: schedule, error: scheduleError } = await supabase
    .from('bake_schedules')
    .select('id, steps')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (scheduleError || !schedule) {
    return NextResponse.json({ error: 'Bake schedule not found' }, { status: 404 })
  }

  const steps = schedule.steps as unknown[]
  if (stepIndex >= steps.length) {
    return NextResponse.json({ error: 'Step index out of range' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const timestampUpdate =
    action === 'start' ? { started_at: now }
    : action === 'complete' ? { completed_at: now }
    : { started_at: null, completed_at: null }

  const { data: progress, error: upsertError } = await supabase
    .from('bake_step_progress')
    .upsert(
      { bake_schedule_id: id, user_id: user.id, step_index: stepIndex, ...timestampUpdate },
      { onConflict: 'bake_schedule_id,step_index' }
    )
    .select()
    .single()

  if (upsertError) {
    console.error('[bake-schedule/progress] upsert error:', upsertError)
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  if (action === 'complete') {
    const { data: allProgress } = await supabase
      .from('bake_step_progress')
      .select('step_index, completed_at')
      .eq('bake_schedule_id', id)

    const completedIndexes = new Set((allProgress ?? []).filter(p => p.completed_at).map(p => p.step_index))
    const allStepsDone = steps.every((_, i) => completedIndexes.has(i))
    if (allStepsDone) {
      await supabase.from('bake_schedules').update({ completed: true }).eq('id', id)
    }
  }

  return NextResponse.json({ progress })
}
