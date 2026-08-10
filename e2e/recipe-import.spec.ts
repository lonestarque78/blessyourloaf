import { test, expect } from '@playwright/test'
import { createTestUser, deleteTestUser, type TestUser } from './support/test-users'
import { startFixtureRecipeServer, FIXTURE_RECIPE_TITLE, type FixtureServer } from './support/fixture-recipe-server'
import { loginAs } from './support/actions'

test.describe('recipe import by URL', () => {
  let user: TestUser
  let fixture: FixtureServer

  test.beforeAll(async () => {
    user = await createTestUser('recipe-import')
    fixture = await startFixtureRecipeServer()
  })

  test.afterAll(async () => {
    await fixture.close()
    await deleteTestUser(user.id)
  })

  test('importing a recipe URL with structured data fills in the draft form', async ({ page }) => {
    await loginAs(page, user)
    await page.goto('/dashboard/my-recipes/new')

    await page.getByPlaceholder('https://example.com/recipe').fill(fixture.url)
    await page.getByRole('button', { name: 'Import Recipe' }).click()

    await expect(page.getByText('Recipe imported. Review the details and save when you are ready.')).toBeVisible()
    await expect(page.getByPlaceholder('Jalapeño Cheddar Loaf...')).toHaveValue(FIXTURE_RECIPE_TITLE)

    // The fixture's 4 recipeIngredient lines should have replaced the single blank starter row.
    const ingredientItems = page.getByPlaceholder('bread flour')
    await expect(ingredientItems).toHaveCount(4)
    await expect(ingredientItems.first()).not.toHaveValue('')
  })
})
