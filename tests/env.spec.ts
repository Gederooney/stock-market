import { test, expect } from '@playwright/test';

test.describe('Environment Variables Management', () => {
  test('should show env status indicator in development', async ({ page }) => {
    // Navigate to home page
    await page.goto('http://localhost:3000');
    
    // Check for env status button
    const envButton = page.locator('button').filter({ hasText: /^$/ }).last();
    await expect(envButton).toBeVisible();
    
    // Click to open status panel
    await envButton.click();
    
    // Check status panel is visible
    const statusPanel = page.locator('text=Environment Status');
    await expect(statusPanel).toBeVisible();
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/env-status.png', fullPage: true });
  });
  
  test('should validate authentication pages work', async ({ page }) => {
    // Go to signin page
    await page.goto('http://localhost:3000/auth/signin');
    await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
    
    // Go to signup page
    await page.goto('http://localhost:3000/auth/signup');
    await expect(page.locator('h2:has-text("Create Account")')).toBeVisible();
    
    // Take screenshots
    await page.screenshot({ path: 'tests/screenshots/auth-signin.png' });
    await page.goto('http://localhost:3000/auth/signin');
    await page.screenshot({ path: 'tests/screenshots/auth-signup.png' });
  });
  
  test('should handle missing env variables gracefully', async ({ page }) => {
    // Check API endpoint for env status
    const response = await page.request.get('http://localhost:3000/api/env/status');
    
    if (process.env.NODE_ENV === 'development') {
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('isValid');
      expect(data).toHaveProperty('errors');
      expect(data).toHaveProperty('warnings');
    } else {
      expect(response.status()).toBe(403);
    }
  });
});