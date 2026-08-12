import { test, expect } from '@playwright/test'
import { createTestUser, deleteTestUser, type TestUser } from './support/test-users'
import { loginAs } from './support/actions'

// Both tests below make a real Anthropic call each (2 total) — deliberately, per the Phase 5
// build-plan criterion that each new AI skill "responds correctly to a real test case," not
// just a mocked one. A fresh test user has the full FREE_DAILY_AI_LIMIT (2) available, so both
// calls fit inside the free tier without hitting the quota gate (already covered separately
// by ai-quota.spec.ts).
test.describe('ingredient substitution and recipe generation AI skills', () => {
  let user: TestUser

  test.beforeAll(async () => {
    user = await createTestUser('ai-skills')
  })

  test.afterAll(async () => {
    await deleteTestUser(user.id)
  })

  test('ingredient substitution answers an on-topic question', async ({ page }) => {
    // Overrides the config's default 60s per-test timeout, which the assertion's own 45s
    // timeout below could butt up against once login/navigation overhead is added on top.
    test.setTimeout(90_000)
    await loginAs(page, user)
    await page.goto('/dashboard/ingredient-substitution')

    const input = page.getByPlaceholder("Tell us what you're missing... (Shift+Enter for new line)")
    await input.fill('What can I use instead of bread flour if I only have all-purpose flour?')
    await page.getByRole('button', { name: '→' }).click()

    // Real, non-deterministic model output — assert on structure (an assistant reply
    // actually rendered) rather than exact wording. Generous timeout for the same reason as
    // the recipe-generation test below: real Anthropic latency under concurrent CI workers.
    await expect(page.getByText('Substitution Guide')).toBeVisible({ timeout: 45_000 })
  })

  test('recipe generation populates the new-recipe form from a description', async ({ page }) => {
    // Overrides the config's default 60s per-test timeout — the assertion below alone waits
    // up to 60s, which would otherwise butt up against (or exceed) the test-level budget once
    // login/navigation overhead is added on top.
    test.setTimeout(90_000)
    await loginAs(page, user)
    await page.goto('/dashboard/my-recipes/new')

    await page.getByPlaceholder('A rosemary olive oil boule for a dinner party...').fill('A simple whole wheat sandwich loaf')
    await page.getByRole('button', { name: 'Generate Recipe' }).click()

    // Composing a fresh recipe takes longer than a short chat reply, and the route's own
    // maxDuration budget (recipe-generation/route.ts) is 60s — match that here rather than
    // the shorter timeout used for the chat-based ingredient-substitution assertion below,
    // which was too tight under concurrent load from the rest of this suite's workers.
    await expect(page.getByText('Recipe generated. Review the details and save when you are ready.')).toBeVisible({ timeout: 60_000 })
    // The title field starts empty — a non-empty value proves the generated recipe was
    // actually applied to the form, not just that the request succeeded.
    await expect(page.getByPlaceholder('Jalapeño Cheddar Loaf...')).not.toHaveValue('')
  })
})
