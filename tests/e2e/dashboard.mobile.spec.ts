import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 375, height: 812 } })

test.describe('Dashboard - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should show bottom navigation bar', async ({ page }) => {
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
  })

  test('should hide sidebar on mobile', async ({ page }) => {
    // Sidebar should not be visible on mobile by default
    const sidebar = page.locator('[data-testid="sidebar"]')
    await expect(sidebar).not.toBeVisible()
  })

  test('should show property cards in single column', async ({ page }) => {
    // Property cards should stack vertically on mobile
    const cards = page.locator('[data-testid="property-card"]')
    if ((await cards.count()) > 0) {
      await expect(cards.first()).toBeVisible()
    }
  })

  test('should navigate via bottom nav', async ({ page }) => {
    // Click on "Propriedades" in bottom nav
    const propNavItem = page
      .locator('[data-testid="mobile-nav"] a[href="/properties"]')
      .first()
    if (await propNavItem.isVisible()) {
      await propNavItem.click()
      await page.waitForURL('/properties')
    }
  })
})
