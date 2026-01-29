import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('home page has no critical a11y violations', async ({ page }) => {
  await page.goto('/')

  const results = await new AxeBuilder({ page })
    .disableRules(['color-contrast'])
    .analyze()

  expect(results.violations).toEqual([])
})
