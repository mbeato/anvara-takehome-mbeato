import { test, expect, type Browser } from '@playwright/test';

/**
 * A/B Testing Verification (SC 1-3)
 *
 * Verifies that the middleware (proxy.ts) correctly assigns A/B variant cookies
 * and that the useABTest hook respects debug URL parameter overrides.
 *
 * Cookie: ab_cta-copy (set by proxy.ts middleware)
 * - value: "A" or "B"
 * - path: /
 * - sameSite: Lax
 * - maxAge: 30 days
 */

test.describe('A/B Testing Verification', () => {
  /**
   * SC1: Two separate browser contexts receive variant cookies with correct properties.
   *
   * Each context is a fresh cookie jar. The middleware sets ab_cta-copy if absent.
   * Both may receive the same variant (random), but both must have the cookie.
   */
  test('SC1: Two browser contexts receive variant cookies with correct properties', async ({
    browser,
  }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Navigate both contexts to /marketplace to trigger middleware
    await pageA.goto('/marketplace');
    await pageA.waitForLoadState('networkidle');
    await pageB.goto('/marketplace');
    await pageB.waitForLoadState('networkidle');

    // Retrieve cookies from both contexts
    const cookiesA = await contextA.cookies();
    const cookiesB = await contextB.cookies();

    const abCookieA = cookiesA.find((c) => c.name === 'ab_cta-copy');
    const abCookieB = cookiesB.find((c) => c.name === 'ab_cta-copy');

    // Assert both cookies exist
    expect(abCookieA, 'Context A should have ab_cta-copy cookie').toBeDefined();
    expect(abCookieB, 'Context B should have ab_cta-copy cookie').toBeDefined();

    // Assert cookie properties for Context A
    expect(abCookieA!.path).toBe('/');
    expect(abCookieA!.sameSite).toBe('Lax');
    expect(abCookieA!.value).toMatch(/^[AB]$/);
    // expires should be ~30 days from now (at least 29 days)
    const minExpiry = Date.now() / 1000 + 29 * 86400;
    expect(abCookieA!.expires).toBeGreaterThan(minExpiry);

    // Assert cookie properties for Context B
    expect(abCookieB!.path).toBe('/');
    expect(abCookieB!.sameSite).toBe('Lax');
    expect(abCookieB!.value).toMatch(/^[AB]$/);
    expect(abCookieB!.expires).toBeGreaterThan(minExpiry);

    // Log variants for visibility (both may be the same -- that's valid)
    console.log(`Context A variant: ${abCookieA!.value}`);
    console.log(`Context B variant: ${abCookieB!.value}`);

    await contextA.close();
    await contextB.close();
  });

  /**
   * SC2: Clearing cookies and revisiting triggers new cookie assignment.
   *
   * Middleware re-sets ab_cta-copy when the cookie is absent. After clearing
   * cookies and revisiting, a new cookie should appear. The value may or may
   * not differ (50/50 random).
   */
  test('SC2: Clearing cookies and revisiting triggers re-randomization', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // First visit -- middleware sets cookie
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    const cookiesBefore = await context.cookies();
    const abCookieBefore = cookiesBefore.find((c) => c.name === 'ab_cta-copy');
    expect(abCookieBefore, 'Cookie should exist after first visit').toBeDefined();
    const valueBefore = abCookieBefore!.value;

    // Clear all cookies
    await context.clearCookies();

    // Verify cookie is cleared
    const cookiesCleared = await context.cookies();
    const abCookieCleared = cookiesCleared.find((c) => c.name === 'ab_cta-copy');
    expect(abCookieCleared, 'Cookie should be cleared').toBeUndefined();

    // Second visit -- middleware should re-set cookie
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    const cookiesAfter = await context.cookies();
    const abCookieAfter = cookiesAfter.find((c) => c.name === 'ab_cta-copy');

    // Assert cookie was re-assigned
    expect(abCookieAfter, 'Cookie should exist after second visit').toBeDefined();
    expect(abCookieAfter!.path).toBe('/');
    expect(abCookieAfter!.sameSite).toBe('Lax');
    expect(abCookieAfter!.value).toMatch(/^[AB]$/);

    const minExpiry = Date.now() / 1000 + 29 * 86400;
    expect(abCookieAfter!.expires).toBeGreaterThan(minExpiry);

    // Log both values (may be same or different)
    console.log(`Before clear: ${valueBefore}, After clear: ${abCookieAfter!.value}`);

    await context.close();
  });

  /**
   * SC3a: Debug URL parameter ?ab_cta-copy=A forces variant A.
   *
   * The useABTest hook reads URL params: if ?ab_cta-copy=A is present,
   * it stores "A" in sessionStorage as ab_override_cta-copy and uses it
   * as the active variant regardless of the cookie value.
   */
  test('SC3a: Debug URL ?ab_cta-copy=A forces variant A', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate with debug URL parameter
    await page.goto('/marketplace/1?ab_cta-copy=A');
    await page.waitForLoadState('networkidle');

    // The useABTest hook stores URL override in sessionStorage
    const sessionValue = await page.evaluate(() =>
      sessionStorage.getItem('ab_override_cta-copy')
    );

    expect(sessionValue).toBe('A');

    await context.close();
  });

  /**
   * SC3b: Debug URL parameter ?ab_cta-copy=B forces variant B.
   *
   * Same mechanism as SC3a but with variant B.
   */
  test('SC3b: Debug URL ?ab_cta-copy=B forces variant B', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate with debug URL parameter
    await page.goto('/marketplace/1?ab_cta-copy=B');
    await page.waitForLoadState('networkidle');

    // The useABTest hook stores URL override in sessionStorage
    const sessionValue = await page.evaluate(() =>
      sessionStorage.getItem('ab_override_cta-copy')
    );

    expect(sessionValue).toBe('B');

    await context.close();
  });
});
