import { test, expect } from '@playwright/test'

const storageState = process.env.E2E_STORAGE_STATE

test.describe('authenticated flow', () => {
  test.skip(!storageState, 'E2E_STORAGE_STATE not provided')

  test.use({ storageState })

  test('can access content types page', async ({ page }) => {
    await page.goto('/content-types')
    await expect(page.getByRole('link', { name: 'Adicionar tipo' })).toBeVisible()
  })
})
