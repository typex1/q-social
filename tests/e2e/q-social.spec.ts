import { test, expect } from '@playwright/test';

test.describe('Q-Social Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Req #1: Post a valid message', async ({ page }) => {
    const testMessage = 'Test message from Playwright';
    
    await page.fill('textarea', testMessage);
    await page.click('button[type="submit"]');
    
    // Verify message appears in feed
    await expect(page.locator('.message').first()).toContainText(testMessage);
  });

  test('Req #1: Reject empty message', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Button should be disabled or error shown
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('Req #1: Reject message over 280 characters', async ({ page }) => {
    const longMessage = 'a'.repeat(281);
    
    await page.fill('textarea', longMessage);
    await page.click('button[type="submit"]');
    
    // Error message should appear
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('Req #2: Messages appear in reverse chronological order', async ({ page }) => {
    const message1 = 'First message ' + Date.now();
    const message2 = 'Second message ' + Date.now();
    
    // Post first message
    await page.fill('textarea', message1);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(100);
    
    // Post second message
    await page.fill('textarea', message2);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(100);
    
    // Second message should be first in feed
    const messages = page.locator('.message');
    await expect(messages.first()).toContainText(message2);
  });

  test('Req #4: Character counter updates', async ({ page }) => {
    const testText = 'Hello';
    
    await page.fill('textarea', testText);
    
    // Counter should show remaining characters
    const counter = page.locator('text=/\\d+ characters remaining/');
    await expect(counter).toBeVisible();
    
    const counterText = await counter.textContent();
    expect(counterText).toContain((280 - testText.length).toString());
  });

  test('Req #4: Character counter turns red when negative', async ({ page }) => {
    const longText = 'a'.repeat(281);
    
    await page.fill('textarea', longText);
    
    // Counter should have error class
    const counter = page.locator('text=/\\d+ characters remaining/');
    await expect(counter).toHaveClass(/error/);
  });

  test('Req #4: Timestamps are displayed', async ({ page }) => {
    const testMessage = 'Message with timestamp';
    
    await page.fill('textarea', testMessage);
    await page.click('button[type="submit"]');
    
    // Timestamp should be visible
    const timestamp = page.locator('.message time').first();
    await expect(timestamp).toBeVisible();
  });

  test('Req #7: Network error handling', async ({ page }) => {
    // Intercept API call and simulate network error
    await page.route('**/api/messages', route => route.abort());
    
    await page.fill('textarea', 'Test message');
    await page.click('button[type="submit"]');
    
    // Error message should appear
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('Form clears after successful post', async ({ page }) => {
    const testMessage = 'Message to clear';
    
    await page.fill('textarea', testMessage);
    await page.click('button[type="submit"]');
    
    // Wait for message to appear
    await expect(page.locator('.message').first()).toContainText(testMessage);
    
    // Textarea should be empty
    const textarea = page.locator('textarea');
    await expect(textarea).toHaveValue('');
  });

  test('Submit button disabled when textarea empty', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    // Should be disabled initially
    await expect(submitButton).toBeDisabled();
    
    // Should enable when text entered
    await page.fill('textarea', 'Some text');
    await expect(submitButton).toBeEnabled();
    
    // Should disable when cleared
    await page.fill('textarea', '');
    await expect(submitButton).toBeDisabled();
  });
});
