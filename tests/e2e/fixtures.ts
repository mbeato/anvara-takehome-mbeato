import { test as base, expect, type ConsoleMessage, type Page } from '@playwright/test';

export { expect, type ConsoleMessage };

/**
 * Shared Playwright fixtures for E2E tests.
 *
 * Provides:
 * - `sponsorContext` — a fresh BrowserContext (created and closed automatically)
 * - `sponsorPage` — a Page within sponsorContext, already logged in as a sponsor
 * - `loginAsSponsor()` — standalone helper for tests that manage their own context
 */

// ---------------------------------------------------------------------------
// Standalone helper (for specs that create their own BrowserContext)
// ---------------------------------------------------------------------------

/** Log in as a sponsor via the login page. */
export async function loginAsSponsor(page: Page) {
  await page.goto('/login');

  const submitButton = page.getByRole('button', { name: /login as sponsor/i });
  await expect(submitButton).toBeVisible({ timeout: 10000 });
  await submitButton.click();

  await page.waitForURL('**/dashboard/**', { timeout: 15000 });
}

// ---------------------------------------------------------------------------
// Fixture types
// ---------------------------------------------------------------------------

type TestFixtures = {
  sponsorContext: import('@playwright/test').BrowserContext;
  sponsorPage: Page;
};

// ---------------------------------------------------------------------------
// Extended test object
// ---------------------------------------------------------------------------

export const test = base.extend<TestFixtures>({
  sponsorContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    await use(context);
    await context.close();
  },

  sponsorPage: async ({ sponsorContext }, use) => {
    const page = await sponsorContext.newPage();
    await loginAsSponsor(page);
    await use(page);
  },
});
