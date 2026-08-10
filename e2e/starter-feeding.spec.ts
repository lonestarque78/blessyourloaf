import { test, expect, type Page } from '@playwright/test'
import { createTestUser, deleteTestUser, type TestUser } from './support/test-users'
import { loginAs } from './support/actions'

test.describe('starter feeding log and growth chart', () => {
  let user: TestUser

  test.beforeAll(async () => {
    user = await createTestUser('starter-feeding')
  })

  test.afterAll(async () => {
    await deleteTestUser(user.id)
  })

  test('logging two feedings updates the growth chart without a page reload', async ({ page }) => {
    await loginAs(page, user)

    await page.goto('/dashboard/starters/new')
    await page.getByPlaceholder('Willow, Biscuit, Rosie...').fill('E2E Test Starter')
    await page.getByRole('button', { name: 'Welcome Her to the World 🫙' }).click()
    await page.waitForURL('**/dashboard/starters/**')

    // GrowthChart needs >= 2 feedings with a rise % before it renders a real chart.
    await expect(page.getByText('Log a couple more feedings')).toBeVisible()

    // Explicit, hours-apart timestamps — realistic (feedings aren't logged seconds apart) and
    // sidesteps a real ambiguity in GrowthChart's sort: fed_at only has minute precision (a
    // native datetime-local input), so two feedings logged within the same minute — entirely
    // possible for an automated run, not for an actual baker — tie on the sort key and the
    // "Latest" stat can end up reflecting insertion order rather than chronological order.
    const now = Date.now()
    await logFeeding(page, 80, new Date(now - 4 * 60 * 60 * 1000))
    await logFeeding(page, 120, new Date(now))

    await expect(page.getByText('Growth Trend')).toBeVisible()
    await expect(page.getByText('Log a couple more feedings')).not.toBeVisible()

    // "Latest" stat reflects the second feeding's rise % — proves the chart re-rendered from
    // the same client-side state FeedingLog just updated (StarterFeedingsSection), not a
    // stale server-rendered value that would need a reload to catch up.
    const latestValue = page.getByText('Latest', { exact: true }).locator('xpath=following-sibling::div[1]')
    await expect(latestValue).toHaveText('120%')

    await expect(page.getByText('Feeding #1')).toBeVisible()
    await expect(page.getByText('Feeding #2')).toBeVisible()
  })
})

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

async function logFeeding(page: Page, risePercent: number, fedAt: Date): Promise<void> {
  // Real bug found via this test, not just an automation quirk (see e2e run summary): after
  // a feeding saves, the tall form collapses but the browser doesn't adjust scroll position,
  // leaving "+ Log a Feeding" stranded above the viewport — right behind the sticky nav once
  // scrolled into view, so a click there doesn't register. Scrolling to top first is the
  // workaround here; the underlying app behavior is left as-is per this suite's scope.
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('button', { name: '+ Log a Feeding' }).click()
  await page.locator('input[type="datetime-local"]').fill(toDatetimeLocalValue(fedAt))
  await page.getByPlaceholder('100').fill(String(risePercent))
  await page.getByRole('button', { name: 'Save Feeding' }).click()
  await expect(page.getByRole('button', { name: 'Save Feeding' })).not.toBeVisible()
}
