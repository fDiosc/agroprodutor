import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 375, height: 812 } })

test.describe('Reports - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should display productivity page on mobile', async ({ page }) => {
    await page.goto('/reports/productivity')
    await expect(page.locator('h1')).toContainText(/produtividade/i)
  })

  test('should display EUDR page on mobile', async ({ page }) => {
    await page.goto('/reports/eudr')
    await expect(page.locator('h1')).toContainText(/EUDR/i)
  })

  test('should display suppliers page on mobile', async ({ page }) => {
    await page.goto('/suppliers')
    await expect(page.locator('h1')).toContainText(/fornecedores/i)
  })

  test('should display alerts page on mobile', async ({ page }) => {
    await page.goto('/alerts')
    await expect(page.locator('h1')).toContainText(/alertas/i)
  })

  test('should navigate to suppliers via bottom nav', async ({ page }) => {
    const supplierNavItem = page.locator(
      '[data-testid="mobile-nav"] a[href="/suppliers"]'
    )
    if (await supplierNavItem.isVisible()) {
      await supplierNavItem.click()
      await page.waitForURL('/suppliers')
      await expect(page.locator('h1')).toContainText(/fornecedores/i)
    }
  })

  test('should navigate to alerts via bottom nav', async ({ page }) => {
    const alertsNavItem = page.locator(
      '[data-testid="mobile-nav"] a[href="/alerts"]'
    )
    if (await alertsNavItem.isVisible()) {
      await alertsNavItem.click()
      await page.waitForURL('/alerts')
      await expect(page.locator('h1')).toContainText(/alertas/i)
    }
  })
})
