import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import FeedingLog from '@/components/starters/FeedingLog'

export default async function StarterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: starter } = await supabase
    .from('starters')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!starter) notFound()

  const { data: feedings } = await supabase
    .from('feedings')
    .select('*')
    .eq('starter_id', starter.id)
    .order('fed_at', { ascending: false })

  const daysSinceBorn = Math.floor(
    (new Date().getTime() - new Date(starter.born_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/dashboard/starters" className="font-lora text-sm text-[#b07d62] hover:underline mb-6 block">
        ← Back to Starters
      </Link>

      {/* Starter header */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-[#f0e4db] mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">🫙</span>
              <h1 className="font-playfair text-4xl font-bold text-[#3d2b1f]">{starter.name}</h1>
            </div>
            {starter.nickname && (
              <p className="font-lora italic text-[#9a7060] ml-14">"{starter.nickname}"</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/starters/${id}/edit`}
              className="font-lora text-sm text-[#b07d62] hover:underline">
              Edit
            </Link>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-lora text-xs ${
              starter.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${starter.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
              {starter.is_active ? 'Active' : 'Resting'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {[
            { label: 'Birthday', value: new Date(starter.born_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
            { label: 'Age', value: `${daysSinceBorn} days old` },
            { label: 'Flour', value: starter.flour_type.charAt(0).toUpperCase() + starter.flour_type.slice(1) },
            { label: 'Hydration', value: `${starter.hydration_percent}%` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-lora text-xs uppercase tracking-widest text-[#b8896e] mb-1">{label}</div>
              <div className="font-lora text-sm text-[#3d2b1f]">{value}</div>
            </div>
          ))}
        </div>

        {starter.notes && (
          <div className="mt-6 bg-[#f9ede5] rounded-xl p-4 font-lora italic text-sm text-[#7a4f3a]">
            💬 {starter.notes}
          </div>
        )}
      </div>

      {/* Feeding log */}
      <FeedingLog starterId={starter.id} starterName={starter.name} initialFeedings={feedings || []} />
    </div>
  )
}