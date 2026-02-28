import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3847',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm dev',
    cwd: '../..',
    url: 'http://localhost:3847',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
