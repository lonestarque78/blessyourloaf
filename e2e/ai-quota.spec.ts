import { test, expect } from '@playwright/test'
import { createTestUser, deleteTestUser, getAdminClient, type TestUser } from './support/test-users'
import { loginAs } from './support/actions'

const FREE_DAILY_AI_LIMIT = 2

test.describe('free-tier AI quota gate', () => {
  let user: TestUser

  test.beforeAll(async () => {
    user = await createTestUser('ai-quota')

    // Seeds today's usage directly instead of spending two real Anthropic calls to get
    // there — src/lib/ai-usage.test.ts already unit-tests the counting logic (getRemaining
    // FreeAiActions, recordAiUsage) in isolation. This test only needs to prove the gate
    // fires end-to-end, through the real UI and the real /api/troubleshooter route, once the
    // limit is reached — the quota check happens before any Anthropic call either way.
    const admin = getAdminClient()
    const { error } = await admin
      .from('ai_usage_events')
      .insert(Array.from({ length: FREE_DAILY_AI_LIMIT }, () => ({ user_id: user.id, action: 'troubleshooter' })))
    if (error) throw new Error(`Failed to seed AI usage events: ${error.message}`)
  })

  test.afterAll(async () => {
    await deleteTestUser(user.id)
  })

  test('a free user who already used 2 actions today is gated on the 3rd', async ({ page }) => {
    await loginAs(page, user)
    await page.goto('/dashboard/troubleshooter')

    // Deliberately on-topic and >4 words, so the cheap keyword pre-filter (looksOffTopic)
    // lets it through to the real quota check instead of short-circuiting on its own.
    const input = page.getByPlaceholder("Describe what's going on with your starter... (Shift+Enter for new line)")
    await input.fill('My sourdough starter smells like nail polish and has stopped rising since its last feeding.')
    await page.getByRole('button', { name: '→' }).click()

    await expect(page.getByText(`You've used your ${FREE_DAILY_AI_LIMIT} free AI actions for today`)).toBeVisible()
  })
})
