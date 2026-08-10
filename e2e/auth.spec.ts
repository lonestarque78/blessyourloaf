import { test, expect } from '@playwright/test'
import { e2eEmail, e2ePassword, findUserIdByEmail, confirmTestUserEmail, deleteTestUser } from './support/test-users'

test.describe('signup and login', () => {
  const email = e2eEmail('signup')
  const password = e2ePassword()
  let userId: string | null = null

  test.afterAll(async () => {
    if (userId) await deleteTestUser(userId)
  })

  test('a new baker can sign up, then log in with the same credentials', async ({ page }) => {
    await page.goto('/signup')

    await page.getByPlaceholder('Jane Baker').fill('E2E Signup Baker')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('••••••••').fill(password)
    await page.getByRole('button', { name: 'Create Free Account' }).click()

    await expect(page.getByText('Check your email!')).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()

    // The real flow requires clicking an emailed confirmation link, which this suite can't
    // do — confirm directly via the Supabase admin API instead, then prove login works
    // against the exact account the UI just created (not a stand-in created by the suite).
    userId = await findUserIdByEmail(email)
    await confirmTestUserEmail(userId)

    await page.goto('/login')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('••••••••').fill(password)
    await page.getByRole('button', { name: 'Log In' }).click()

    await page.waitForURL('**/dashboard')
    await expect(page.getByRole('link', { name: 'Bless Your Loaf' })).toBeVisible()
  })
})
