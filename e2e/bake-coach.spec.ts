import { test, expect } from '@playwright/test'
import { createTestUser, deleteTestUser, getAdminClient, type TestUser } from './support/test-users'
import { loginAs } from './support/actions'

test.describe('Bake Coach full cycle', () => {
  let user: TestUser
  let scheduleId: string

  test.beforeAll(async () => {
    user = await createTestUser('bake-coach')

    // Seeds a saved bake_schedules row directly, bypassing the AI bake-schedule generation
    // endpoint — that would spend one of this user's 2 free daily AI actions, and this test
    // only needs a schedule to exist so it can drive the coach UI itself (the thing the task
    // actually asks for), not to re-prove schedule generation.
    const admin = getAdminClient()
    const targetReadyAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    const { data, error } = await admin
      .from('bake_schedules')
      .insert({
        user_id: user.id,
        recipe_name: 'E2E Test Bake',
        target_ready_at: targetReadyAt,
        steps: [
          { time: '', action: 'Autolyse the flour and water', duration: '1 minute', note: '', phase: 'autolyse' },
          { time: '', action: 'Mix in starter and salt', duration: '', note: '', phase: 'other' },
          { time: '', action: 'Bake', duration: '', note: '', phase: 'bake' },
        ],
        completed: false,
      })
      .select('id')
      .single()

    if (error || !data) throw new Error(`Failed to seed bake schedule: ${error?.message}`)
    scheduleId = data.id
  })

  test.afterAll(async () => {
    await deleteTestUser(user.id)
  })

  test('a baker can start a timer and mark every step done through to completion', async ({ page }) => {
    await loginAs(page, user)
    await page.goto(`/dashboard/bake/${scheduleId}`)

    await expect(page.getByText('Step 1 of 3')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Autolyse the flour and water' })).toBeVisible()

    // Step 1 has a duration ("1 minute") — exercise the timer, then complete without waiting
    // for it to run out, since "Mark Done" is always available regardless of timer state.
    await page.getByRole('button', { name: 'Start Timer' }).click()
    await expect(page.getByText(/^\d{2}:\d{2}$/)).toBeVisible()
    await page.getByRole('button', { name: 'Mark Done →' }).click()

    await expect(page.getByText('Step 2 of 3')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Mix in starter and salt' })).toBeVisible()
    await page.getByRole('button', { name: 'Mark Done →' }).click()

    await expect(page.getByText('Step 3 of 3')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Bake', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Mark Done →' }).click()

    await expect(page.getByRole('heading', { name: 'You did it!' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'View This Bake' })).toBeVisible()
  })
})
