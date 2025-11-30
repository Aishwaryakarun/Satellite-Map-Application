import { test, expect } from '@playwright/test'

test('renders mission layout sections', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('header')).toBeVisible()
  await expect(page.getByTestId('summary-panel')).toBeVisible()
  await expect(page.getByTestId('aoi-panel')).toBeVisible()
  await expect(page.getByTestId('map-panel')).toBeVisible()
  await expect(page.getByTestId('layer-panel')).toBeVisible()
  await expect(page.getByTestId('insights-panel')).toBeVisible()
  await expect(page.getByTestId('timeline-panel')).toBeVisible()
})

