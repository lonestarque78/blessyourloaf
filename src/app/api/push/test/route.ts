import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushToUser } from '@/lib/push-notifications'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summary = await sendPushToUser(supabase, user.id, {
      title: 'Bless Your Loaf',
      body: "This is a test notification — your starter's push alerts are wired up.",
      url: '/dashboard/starters',
    })

    if (summary.sent === 0) {
      return NextResponse.json(
        { error: 'No active subscription could be reached. Try enabling notifications again.', summary },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: true, summary })
  } catch (err) {
    console.error('[push/test] failed to send test notification', err)
    return NextResponse.json({ error: 'Failed to send test notification' }, { status: 500 })
  }
}
