import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import BakeCoach from '@/components/bake/BakeCoach'

export default async function BakeCoachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: schedule } = await supabase
    .from('bake_schedules')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!schedule) notFound()

  const { data: progress } = await supabase
    .from('bake_step_progress')
    .select('step_index, started_at, completed_at')
    .eq('bake_schedule_id', id)

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <Link href={`/dashboard/history/${id}`} className="font-lora text-sm text-[#b07d62] hover:underline mb-4 block">
        ← Back to Bake Details
      </Link>

      <BakeCoach schedule={schedule} initialProgress={progress ?? []} />
    </div>
  )
}
