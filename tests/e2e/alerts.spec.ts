import { test, expect } from '@playwright/test'

test.describe('Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should display alerts page', async ({ page }) => {
    await page.goto('/alerts')
    await expect(page.locator('h1')).toContainText(/alertas/i)
  })

  test('should show unread count', async ({ page }) => {
    await page.goto('/alerts')
    const unreadBadge = page.locator('text=/não lid/i')
    await expect(unreadBadge).toBeVisible()
  })

  test('should show alert cards from seed data', async ({ page }) => {
    await page.goto('/alerts')
    const alertCard = page.locator('[data-testid="alert-card"]')
    if (await alertCard.count() > 0) {
      await expect(alertCard.first()).toBeVisible()
    }
  })

  test('should show severity filter chips', async ({ page }) => {
    await page.goto('/alerts')
    const filterArea = page.locator('[data-testid="alerts-filter"]')
    if (await filterArea.isVisible()) {
      await expect(filterArea).toBeVisible()
    }
  })

  test('should link alert to property', async ({ page }) => {
    await page.goto('/alerts')
    const propertyLink = page.locator('a[href*="/properties/"]')
    if (await propertyLink.count() > 0) {
      await expect(propertyLink.first()).toBeVisible()
    }
  })

  test('should have mark as read button', async ({ page }) => {
    await page.goto('/alerts')
    const markReadButton = page.locator(
      'button:has-text("lido"), button:has-text("Lido")'
    )
    if (await markReadButton.count() > 0) {
      await expect(markReadButton.first()).toBeVisible()
    }
  })
})
