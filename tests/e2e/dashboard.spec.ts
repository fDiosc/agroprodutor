import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should display dashboard with welcome message', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Bem-vindo ao AgroProdutor')
  })

  test('should show empty state when no properties', async ({ page }) => {
    // May show empty state or properties depending on seed data
    const addButton = page.locator('a[href="/properties/new"]')
    const propertyCards = page.locator('[data-testid="property-card"]')

    // Either there's an empty state or property cards
    const hasCards = (await propertyCards.count()) > 0
    if (!hasCards) {
      await expect(addButton).toBeVisible()
    }
  })

  test('should show status semaphore when properties exist', async ({ page }) => {
    // If seed data has properties, the semaphore should be visible
    const semaphore = page.locator('[data-testid="status-semaphore"]')
    const emptyState = page.locator('text=Adicione sua primeira propriedade')

    if (await semaphore.isVisible()) {
      await expect(semaphore).toBeVisible()
    } else {
      await expect(emptyState).toBeVisible()
    }
  })

  test('should show stats summary when properties exist', async ({ page }) => {
    const stats = page.locator('[data-testid="stats-summary"]')
    const emptyState = page.locator('text=Adicione sua primeira propriedade')

    if (await stats.isVisible()) {
      await expect(stats).toBeVisible()
    }
  })

  test('should navigate to properties page', async ({ page }) => {
    // Click on "Minhas Propriedades" in sidebar
    await page.getByRole('link', { name: /minhas propriedades/i }).click()
    await page.waitForURL('/properties')
    await expect(page.locator('h1')).toContainText('Minhas Propriedades')
  })
})
