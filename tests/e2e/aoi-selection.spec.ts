import { test, expect } from '@playwright/test'

test('switching AOI updates focus panel', async ({ page }) => {
  await page.goto('/')

  const selectedOverlay = page.getByTestId('selected-aoi-name')
  await expect(selectedOverlay).toHaveText(/Essen Industrial Belt/)

  const cards = page.getByTestId('aoi-card')
  await cards.nth(1).click()
  await expect(selectedOverlay).toHaveText(/Düsseldorf Riverfront/)
})

