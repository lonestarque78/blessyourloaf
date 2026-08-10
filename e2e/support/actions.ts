import type { Page } from '@playwright/test'
import type { TestUser } from './test-users'

// Real UI login, used as a setup step by every spec that needs an authenticated session
// (not just auth.spec.ts) — this is the same path a real baker takes, and it's the only way
// to get the Supabase SSR cookies the rest of the app relies on into the browser context.
export async function loginAs(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login')
  await page.getByPlaceholder('you@example.com').fill(user.email)
  await page.getByPlaceholder('••••••••').fill(user.password)
  await page.getByRole('button', { name: 'Log In' }).click()
  await page.waitForURL('**/dashboard')
}
