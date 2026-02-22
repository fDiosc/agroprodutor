import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/senha/i)).toBeVisible()
  })

  test('should show register page', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /criar conta/i })).toBeVisible()
    await expect(page.getByLabel(/nome/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
  })

  test('should navigate from login to register', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /criar conta|cadastre-se|registrar/i }).click()
    await expect(page).toHaveURL(/\/register/)
  })

  test('should navigate from register to login', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('link', { name: /entrar|login|já tenho/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('nonexistent@test.com')
    await page.getByLabel(/senha/i).fill('wrongpassword')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/inválid|incorret|erro/i)).toBeVisible({ timeout: 5000 })
  })
})
