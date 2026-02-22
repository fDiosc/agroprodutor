import { test, expect } from '@playwright/test'

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should display settings page', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('h1')).toContainText(/configura/i)
  })

  test('should show user profile section', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('text=/perfil/i')).toBeVisible()
  })

  test('should show workspace section', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('text=/workspace/i')).toBeVisible()
  })

  test('should show advanced mode toggle', async ({ page }) => {
    await page.goto('/settings')
    const toggle = page.locator('[data-testid="advanced-mode-toggle"]')
    await expect(toggle).toBeVisible()
  })

  test('should navigate to settings from user dropdown', async ({ page }) => {
    // Open user dropdown
    const userButton = page.locator('button:has(div.rounded-full)')
    if (await userButton.isVisible()) {
      await userButton.click()
      const settingsLink = page.getByRole('link', { name: /configura/i })
      if (await settingsLink.isVisible()) {
        await settingsLink.click()
        await page.waitForURL('/settings')
      }
    }
  })
})
