require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
module.exports = defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./utils/globalSetup.js'),
  fullyParallel: false,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 2 : 0,
  workers: 1, // Single worker to avoid concurrency race conditions on remote QA server
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['./utils/evidenceReporter.js']
  ],
  timeout: 120000,
  expect: {
    timeout: 15000
  },
  use: {
    baseURL: process.env.BASE_URL || 'https://stg.amerck.care',
    headless: process.env.HEADLESS !== 'false',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
