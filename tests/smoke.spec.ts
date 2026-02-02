import { test, expect } from '@playwright/test'

const TITLE_REGEX = /CommX/i

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(TITLE_REGEX)
})
