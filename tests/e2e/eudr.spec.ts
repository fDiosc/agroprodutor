import { test, expect } from '@playwright/test'

test.describe('EUDR Report', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should display EUDR report page', async ({ page }) => {
    await page.goto('/reports/eudr')
    await expect(page.locator('h1')).toContainText(/EUDR/i)
  })

  test('should show property selector', async ({ page }) => {
    await page.goto('/reports/eudr')
    const selector = page.locator('select, [data-testid="property-selector"]')
    await expect(selector).toBeVisible()
  })

  test('should show prompt to select property', async ({ page }) => {
    await page.goto('/reports/eudr')
    await expect(page.locator('text=/selecione|escolha/i')).toBeVisible()
  })

  test('should navigate via sidebar reports submenu', async ({ page }) => {
    const reportsMenu = page.getByText(/relatórios/i)
    if (await reportsMenu.isVisible()) {
      await reportsMenu.click()
      const eudrLink = page.getByRole('link', { name: /EUDR/i })
      if (await eudrLink.isVisible()) {
        await eudrLink.click()
        await page.waitForURL(/\/reports\/eudr/)
      }
    }
  })
})
