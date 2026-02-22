import { test, expect } from '@playwright/test'

test.describe('Properties', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should display properties list page', async ({ page }) => {
    await page.goto('/properties')
    await expect(page.locator('h1')).toContainText('Minhas Propriedades')
  })

  test('should have button to add new property', async ({ page }) => {
    await page.goto('/properties')
    const addButton = page.locator('a[href="/properties/new"]')
    await expect(addButton).toBeVisible()
  })

  test('should navigate to new property form', async ({ page }) => {
    await page.goto('/properties/new')
    await expect(page.locator('h1')).toContainText('Nova Propriedade')
    await expect(page.locator('#carCode')).toBeVisible()
  })

  test('should show validation error for empty CAR code', async ({ page }) => {
    await page.goto('/properties/new')
    await page.getByRole('button', { name: /cadastrar propriedade/i }).click()
    // Should not navigate away - form should show error or required validation
    await expect(page).toHaveURL(/\/properties\/new/)
  })

  test('should show property detail page with ESG report', async ({ page }) => {
    // First go to properties list
    await page.goto('/properties')

    // Click on the first property card (if exists)
    const propertyCard = page.locator('[data-testid="property-card"]').first()
    if (await propertyCard.isVisible()) {
      await propertyCard.click()
      // Should navigate to property detail
      await page.waitForURL(/\/properties\/[a-f0-9-]+/)

      // Should show report sections
      await expect(page.locator('text=Resumo Socioambiental')).toBeVisible()
      await expect(page.locator('text=Dados da Propriedade')).toBeVisible()
    }
  })

  test('should show ESG report with apontamentos table', async ({ page }) => {
    await page.goto('/properties')
    const propertyCard = page.locator('[data-testid="property-card"]').first()
    if (await propertyCard.isVisible()) {
      await propertyCard.click()
      await page.waitForURL(/\/properties\/[a-f0-9-]+/)

      // Check apontamentos table exists
      await expect(page.locator('text=Apontamentos Propriedade')).toBeVisible()
      await expect(page.locator('text=Camadas')).toBeVisible()
    }
  })

  test('should have refresh report button on property detail', async ({
    page,
  }) => {
    await page.goto('/properties')
    const propertyCard = page.locator('[data-testid="property-card"]').first()
    if (await propertyCard.isVisible()) {
      await propertyCard.click()
      await page.waitForURL(/\/properties\/[a-f0-9-]+/)

      const refreshButton = page.getByRole('button', {
        name: /atualizar relatório/i,
      })
      await expect(refreshButton).toBeVisible()
    }
  })
})
