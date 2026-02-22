import { test, expect } from '@playwright/test'

test.describe('Productivity Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should display productivity report page', async ({ page }) => {
    await page.goto('/reports/productivity')
    await expect(page.locator('h1')).toContainText(/produtividade/i)
  })

  test('should show property selector', async ({ page }) => {
    await page.goto('/reports/productivity')
    const selector = page.locator('select, [data-testid="property-selector"]')
    await expect(selector).toBeVisible()
  })

  test('should navigate with property selector', async ({ page }) => {
    await page.goto('/reports/productivity')
    const selector = page.locator('select, [data-testid="property-selector"]')
    if (await selector.isVisible()) {
      const options = selector.locator('option')
      if (await options.count() > 1) {
        await selector.selectOption({ index: 1 })
        await page.waitForURL(/propertyId=/)
      }
    }
  })

  test('should show empty state when no productivity data', async ({ page }) => {
    await page.goto('/reports/productivity')
    await expect(page.locator('text=/selecione|escolha/i')).toBeVisible()
  })
})
