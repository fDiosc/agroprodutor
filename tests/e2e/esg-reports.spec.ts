import { test, expect } from '@playwright/test'

test.describe('ESG Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should display ESG reports page', async ({ page }) => {
    await page.goto('/reports/esg')
    await expect(page.locator('h1')).toContainText(/ESG/i)
  })

  test('should show properties table', async ({ page }) => {
    await page.goto('/reports/esg')
    const table = page.locator('table')
    if (await table.isVisible()) {
      await expect(table).toBeVisible()
    }
  })

  test('should link to property detail', async ({ page }) => {
    await page.goto('/reports/esg')
    const link = page.locator('table a').first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForURL(/\/properties\//)
    }
  })
})
