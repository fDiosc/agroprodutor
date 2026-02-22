import { test, expect } from '@playwright/test'

test.describe('Report History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should show report history on property detail', async ({ page }) => {
    await page.goto('/properties')
    const card = page.locator('[data-testid="property-card"]').first()
    if (await card.isVisible()) {
      await card.click()
      await page.waitForURL(/\/properties\//)
      // History section should exist
      const history = page.locator('text=/histórico/i')
      await expect(history).toBeVisible()
    }
  })
})
