import { test, expect } from '../fixtures/test-fixtures';

test.describe('QA Portal — Login', () => {
  test('logs in successfully with valid credentials', async ({ loginPage, dashboardPage }) => {
    await loginPage.goto();
    await loginPage.loginAs(
      process.env.QA_USERNAME || 'qa.engineer@example.com',
      process.env.QA_PASSWORD || 'test-password'
    );
    await dashboardPage.waitUntilLoaded();
    await expect(dashboardPage.pageHeading).toBeVisible();
  });

  test('shows an error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginAs('invalid.user@example.com', 'wrong-password');
    await loginPage.expectLoginError('Invalid email or password');
  });

  test('blocks submission when password field is empty', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.emailInput.fill('qa.engineer@example.com');
    await loginPage.submitButton.click();
    await expect(page.getByText('Password is required')).toBeVisible();
  });
});
