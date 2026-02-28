import { test, expect, loginAsSponsor } from './fixtures';

/**
 * Mobile Responsive Verification (SC 5)
 *
 * Verifies that all modified marketplace components render correctly at
 * 375px width (iPhone SE / smallest common mobile viewport) with no
 * horizontal overflow.
 *
 * Horizontal overflow check: scrollWidth <= clientWidth on <html> element.
 * If scrollWidth > clientWidth, horizontal scrollbar appears -- a mobile UX bug.
 */

test.describe('Mobile Responsive Verification (375px)', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to 375x667 (iPhone SE dimensions)
    await page.setViewportSize({ width: 375, height: 667 });
  });

  /**
   * SC5: Marketplace grid renders without horizontal overflow at 375px.
   *
   * The ad-slot-grid uses responsive CSS classes (grid gap-4 sm:grid-cols-2
   * lg:grid-cols-3). At 375px, it should be a single column with no overflow.
   */
  test('SC5: Marketplace page has no horizontal overflow at 375px', async ({
    page,
  }) => {
    await loginAsSponsor(page);
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    // Wait for the content to render
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      const html = document.documentElement;
      return html.scrollWidth > html.clientWidth;
    });

    expect(
      hasOverflow,
      'Marketplace page should not have horizontal overflow at 375px'
    ).toBe(false);
  });

  /**
   * SC5: Detail page renders without horizontal overflow at 375px.
   *
   * The detail page has publisher info, pricing, booking form, and related
   * listings. All must fit within 375px without horizontal scrollbar.
   */
  test('SC5: Detail page has no horizontal overflow at 375px', async ({
    page,
  }) => {
    await loginAsSponsor(page);

    // Navigate to a specific listing detail page
    await page.goto('/marketplace/1');
    await page.waitForLoadState('networkidle');

    // Wait for the detail content to load (client-side fetch)
    await expect(page.getByRole('link', { name: /back to marketplace/i })).toBeVisible({ timeout: 10000 });

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      const html = document.documentElement;
      return html.scrollWidth > html.clientWidth;
    });

    expect(
      hasOverflow,
      'Detail page should not have horizontal overflow at 375px'
    ).toBe(false);
  });

  /**
   * SC5: Marketplace cards are readable at 375px.
   *
   * Verify that card elements (name, price, publisher, badges) are visible
   * and not clipped at mobile viewport width.
   */
  test('SC5: Marketplace cards are visible and readable at 375px', async ({
    page,
  }) => {
    await loginAsSponsor(page);
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    // Wait for grid to render
    const firstCard = page.locator('a[href^="/marketplace/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Verify the card fits within viewport width
    const cardBounds = await firstCard.boundingBox();
    expect(cardBounds, 'Card should have a bounding box').toBeTruthy();
    if (cardBounds) {
      // Card should not extend beyond 375px viewport (with some margin for scrollbar)
      expect(cardBounds.x).toBeGreaterThanOrEqual(0);
      expect(cardBounds.x + cardBounds.width).toBeLessThanOrEqual(375);
    }

    // Verify card content elements are visible
    const cardName = firstCard.locator('h3').first();
    await expect(cardName).toBeVisible();

    const cardPrice = firstCard.locator('p').first();
    await expect(cardPrice).toBeVisible();
  });

  /**
   * SC5: Detail page booking form is usable at 375px.
   *
   * Verify buttons and inputs are visible and not clipped at mobile width.
   */
  test('SC5: Detail page interactive elements fit within 375px', async ({
    page,
  }) => {
    await loginAsSponsor(page);
    await page.goto('/marketplace/1');
    await page.waitForLoadState('networkidle');

    // Check that the back link is visible
    const backLink = page.getByRole('link', { name: /back to marketplace/i });
    await expect(backLink).toBeVisible({ timeout: 10000 });

    // Check no element overflows the viewport
    const overflowingElements = await page.evaluate(() => {
      const viewportWidth = 375;
      const all = document.querySelectorAll('*');
      const overflowing: string[] = [];
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.right > viewportWidth + 1) {
          overflowing.push(
            `${el.tagName}.${el.className?.toString().slice(0, 40)} (right: ${Math.round(rect.right)}px)`
          );
        }
      }
      return overflowing;
    });

    // Allow minor sub-pixel rounding but no significant overflow
    const significantOverflow = overflowingElements.filter((el) => {
      const rightMatch = el.match(/right: (\d+)px/);
      return rightMatch && parseInt(rightMatch[1]) > 380; // 5px tolerance
    });

    expect(
      significantOverflow,
      `No elements should overflow 375px viewport. Overflowing: ${significantOverflow.join(', ')}`
    ).toHaveLength(0);
  });

  /**
   * SC5: Login page renders correctly at 375px.
   *
   * The login page is part of the user flow and must not overflow on mobile.
   */
  test('SC5: Login page has no horizontal overflow at 375px', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const hasOverflow = await page.evaluate(() => {
      const html = document.documentElement;
      return html.scrollWidth > html.clientWidth;
    });

    expect(
      hasOverflow,
      'Login page should not have horizontal overflow at 375px'
    ).toBe(false);
  });
});
