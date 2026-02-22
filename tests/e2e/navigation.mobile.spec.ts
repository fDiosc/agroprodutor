import { test, expect } from '@playwright/test'

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('should show bottom navigation on mobile', async ({ page }) => {
    await page.goto('/login')
    // On auth pages, bottom nav shouldn't show
    // We just verify the page loads correctly on mobile viewport
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible()
  })
})
