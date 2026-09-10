import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DeviceDashboardPage } from '../pages/DeviceDashboardPage';
import { OtaBuildPage } from '../pages/OtaBuildPage';

/**
 * Custom fixtures so specs don't repeat page-object instantiation and
 * login boilerplate. Each fixture is lazily created and torn down per test.
 */
type QaFixtures = {
  loginPage: LoginPage;
  dashboardPage: DeviceDashboardPage;
  otaBuildPage: OtaBuildPage;
  authenticatedPage: DeviceDashboardPage;
};

export const test = base.extend<QaFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DeviceDashboardPage(page));
  },

  otaBuildPage: async ({ page }, use) => {
    await use(new OtaBuildPage(page));
  },

  // Pre-authenticated dashboard, for specs that don't need to test login itself
  authenticatedPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(
      process.env.QA_USERNAME || 'qa.engineer@example.com',
      process.env.QA_PASSWORD || 'test-password'
    );
    const dashboard = new DeviceDashboardPage(page);
    await dashboard.waitUntilLoaded();
    await use(dashboard);
  },
});

export { expect };
