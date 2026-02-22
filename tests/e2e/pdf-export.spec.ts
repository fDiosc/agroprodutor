import { test, expect } from '@playwright/test'

test.describe('PDF Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should show PDF export button on property detail', async ({ page }) => {
    await page.goto('/properties')
    const card = page.locator('[data-testid="property-card"]').first()
    if (await card.isVisible()) {
      await card.click()
      await page.waitForURL(/\/properties\//)
      const pdfButton = page.getByRole('button', {
        name: /exportar pdf|pdf/i,
      })
      await expect(pdfButton).toBeVisible()
    }
  })
})
