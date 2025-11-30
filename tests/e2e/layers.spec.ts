import { test, expect } from '@playwright/test'

test('layer toggles change their state', async ({ page }) => {
  await page.goto('/')

  const wmsToggle = page.getByTestId('toggle-wms')
  await expect(wmsToggle).toHaveAttribute('aria-checked', 'true')
  await wmsToggle.click()
  await expect(wmsToggle).toHaveAttribute('aria-checked', 'false')

  const drawnToggle = page.getByTestId('toggle-drawn')
  await expect(drawnToggle).toHaveAttribute('aria-checked', 'true')
  await drawnToggle.click()
  await expect(drawnToggle).toHaveAttribute('aria-checked', 'false')
})

