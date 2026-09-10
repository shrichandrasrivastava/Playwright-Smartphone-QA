import { defineConfig, devices } from '@playwright/test';

/**
 * Config for the device QA / OTA management portal regression suite.
 * BASE_URL and API_BASE_URL are injected via env vars so the same
 * suite can run against staging / pre-prod / prod-canary environments
 * without code changes — mirrors how build validation typically runs
 * against multiple environments before a commercial release sign-off.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'results/junit-report.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://staging.qa-portal.example.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
