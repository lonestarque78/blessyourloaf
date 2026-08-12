import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'

let adminClient: SupabaseClient | null = null

// Service-role client used only from test code (never shipped in the app itself) to create,
// confirm, and delete e2e accounts, and to seed/read rows directly when going through the UI
// would just add flakiness without testing anything new (e.g. AI usage counters).
export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceRoleKey) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to run the e2e suite (see .env.local).'
      )
    }
    adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return adminClient
}

// Real, deliverable mailbox for e2e-created accounts — configurable in this one place so
// changing it never means touching individual specs. blessyourloaf.com is a domain with no
// mailboxes (no MX records); every confirmation email auth.spec.ts's real signup flow sent
// there hard-bounced, which put Supabase's ability to send mail for the whole app at risk
// (see BACKLOG.md, Aug 2026). Plus-addressing on a real inbox means every test email
// actually delivers — nothing bounces — while staying clearly identifiable (the "e2e-"
// prefix plus a tag and timestamp) both in the inbox and in Supabase's user list.
const E2E_MAILBOX_LOCAL = 'brian'
const E2E_MAILBOX_DOMAIN = 'lonestarque.com'

export function e2eEmail(tag: string): string {
  const suffix = `${Date.now()}-${randomBytes(3).toString('hex')}`
  return `${E2E_MAILBOX_LOCAL}+e2e-${tag}-${suffix}@${E2E_MAILBOX_DOMAIN}`
}

export function e2ePassword(): string {
  return `E2e-${randomBytes(9).toString('hex')}!A1`
}

export interface TestUser {
  id: string
  email: string
  password: string
}

// Creates a fully confirmed account directly via the Supabase admin API — skips the real
// email-confirmation link so tests that aren't exercising the signup flow itself (recipe
// import, starter feeding, bake coach, AI quota) can log in immediately. auth.spec.ts is the
// one test that drives real signup through the UI instead of this helper.
export async function createTestUser(tag: string, fullName = 'E2E Test Baker'): Promise<TestUser> {
  const email = e2eEmail(tag)
  const password = e2ePassword()
  const admin = getAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (error || !data.user) {
    throw new Error(`Failed to create e2e test user ${email}: ${error?.message}`)
  }

  return { id: data.user.id, email, password }
}

// Deletes the auth user, which cascades (via `on delete cascade` FKs — see
// supabase/migrations) through profiles, starters, feedings, bake_schedules,
// bake_step_progress, troubleshooter_chats, user_recipes, ai_usage_events, and
// push_subscriptions. Never touches any row this suite didn't create.
export async function deleteTestUser(userId: string): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    console.warn(`[e2e] failed to clean up test user ${userId}: ${error.message}`)
  }
}

// Looks up the profile row created by the `handle_new_user` trigger right after a real UI
// signup (the trigger runs in the same transaction as the auth.users insert, so it's already
// committed by the time supabase.auth.signUp() resolves in the browser — the retry loop here
// is just defensive, not because that's expected to be needed).
export async function findUserIdByEmail(email: string, attempts = 5, delayMs = 500): Promise<string> {
  const admin = getAdminClient()
  for (let i = 0; i < attempts; i++) {
    const { data, error } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
    if (error) throw error
    if (data) return data.id
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
  throw new Error(`Could not find a profile row for ${email} after signup`)
}

export async function confirmTestUserEmail(userId: string): Promise<void> {
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, { email_confirm: true })
  if (error) throw new Error(`Failed to confirm e2e test user ${userId}: ${error.message}`)
}
