import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Vercel Cron (see vercel.json) hits this route on a schedule and sends
// `Authorization: Bearer $CRON_SECRET` — that's the only caller this should ever accept.
// Matches the auth pattern in cron/feeding-reminders/route.ts.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

// Enforces the retention policy the troubleshooter_chats/ingredient_substitution_chats
// migrations set up but nothing previously read: archive_expires_at (default 14 days from
// row creation, fixed at insert time — never bumped by the updated_at trigger) is the real
// bound. Once it's passed, the row — including any photo saved inline in its messages — is
// gone for good, matching the privacy policy's "up to 14 days" language. expires_at (48h) is
// unrelated to deletion; it only governs whether the app resumes a chat as in-progress (see
// troubleshooter/page.tsx) and is left alone here.
const PURGED_TABLES = ['troubleshooter_chats', 'ingredient_substitution_chats'] as const

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const purged: Record<string, number> = {}

  for (const table of PURGED_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .lt('archive_expires_at', now)
      .select('id')

    if (error) {
      console.error(`[cron/retention-purge] failed to purge ${table}`, error)
      return NextResponse.json({ error: `Failed to purge ${table}` }, { status: 500 })
    }

    purged[table] = data?.length ?? 0
  }

  return NextResponse.json({ success: true, purged })
}
