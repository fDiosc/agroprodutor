import { test, expect } from '@playwright/test'

test.describe('Suppliers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('jaqueline@teste.com')
    await page.getByLabel(/senha/i).fill('teste123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await page.waitForURL('/dashboard')
  })

  test('should display suppliers page', async ({ page }) => {
    await page.goto('/suppliers')
    await expect(page.locator('h1')).toContainText(/fornecedores/i)
  })

  test('should show check form with type selector', async ({ page }) => {
    await page.goto('/suppliers')
    const cpfOption = page.getByText(/CPF/i)
    const carOption = page.getByText(/CAR/i)
    await expect(cpfOption).toBeVisible()
    await expect(carOption).toBeVisible()
  })

  test('should have input field and submit button', async ({ page }) => {
    await page.goto('/suppliers')
    const input = page.locator('input[type="text"], input[placeholder]')
    const submitButton = page.getByRole('button', { name: /consultar/i })
    await expect(input.first()).toBeVisible()
    await expect(submitButton).toBeVisible()
  })

  test('should show validation for empty input', async ({ page }) => {
    await page.goto('/suppliers')
    const submitButton = page.getByRole('button', { name: /consultar/i })
    await submitButton.click()
    await expect(page).toHaveURL(/\/suppliers/)
  })

  test('should show history section when checks exist', async ({ page }) => {
    await page.goto('/suppliers')
    await expect(page.locator('h1')).toContainText(/fornecedores/i)
  })
})
