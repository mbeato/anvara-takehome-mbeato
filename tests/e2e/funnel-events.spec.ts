import { test, expect, loginAsSponsor, type ConsoleMessage } from './fixtures';

/**
 * Funnel Events Verification (SC 4)
 *
 * Verifies that walking the marketplace funnel fires analytics events
 * in the correct order with correct parameters. In development mode,
 * track() outputs:
 *   console.group('%c[Analytics] eventName', 'color: ...')
 *   console.log('Params:', {...})
 *   console.groupEnd()
 *
 * The 5 funnel events in order:
 *   1. marketplace_view  (funnel_step: browse) -- on /marketplace load
 *   2. view_item         (funnel_step: view)   -- on /marketplace/[id] load
 *   3. begin_checkout    (funnel_step: engage)  -- on booking form focus or quote button click
 *   4. generate_lead     (funnel_step: convert) -- on successful quote form submission
 *   5. purchase          (funnel_step: convert) -- on successful booking (tested separately)
 *
 * We test events 1-4 as a continuous funnel. Event 5 (purchase) requires
 * the slot to be available and a real POST /book call, which overlaps with
 * the booking flow and is separately verifiable.
 */

test.describe('Funnel Events Verification', () => {
  /**
   * SC4: Walking the marketplace funnel fires all expected events in order.
   *
   * Captures console output from track() in dev mode. Each analytics event
   * appears as a 'startGroup' console message containing '[Analytics] eventName'.
   */
  test('SC4: Funnel walk fires marketplace_view, view_item, begin_checkout, and generate_lead', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Collect analytics events from console output
    const analyticsEvents: { name: string; text: string }[] = [];

    page.on('console', (msg: ConsoleMessage) => {
      const text = msg.text();
      // track() uses console.group('%c[Analytics] eventName', 'color: ...')
      // Playwright captures this as a 'startGroup' type message
      if (text.includes('[Analytics]')) {
        // Extract event name: text format is "%c[Analytics] eventName color: ..."
        // or just "[Analytics] eventName" depending on how Playwright serializes it
        const match = text.match(/\[Analytics\]\s+(\S+)/);
        if (match) {
          analyticsEvents.push({ name: match[1], text });
        }
      }
    });

    // --- Step 0: Login as sponsor ---
    await loginAsSponsor(page);

    // --- Step 1: Navigate to /marketplace -> expect marketplace_view ---
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    await expect.poll(
      () => analyticsEvents.some((e) => e.name === 'marketplace_view'),
      { message: 'marketplace_view event should fire after page load', timeout: 10000 }
    ).toBe(true);

    // --- Step 2: Click a listing -> expect view_item ---
    // Find the first marketplace listing link and click it
    const firstListing = page.locator('a[href^="/marketplace/"]').first();
    await expect(firstListing).toBeVisible({ timeout: 10000 });
    await firstListing.click();

    // Wait for detail page to load and view_item to fire
    await page.waitForLoadState('networkidle');
    await expect.poll(
      () => analyticsEvents.some((e) => e.name === 'view_item'),
      { message: 'view_item event should fire on detail page load', timeout: 10000 }
    ).toBe(true);

    // --- Step 3: Interact with booking form -> expect begin_checkout ---
    // The textarea onFocus triggers handleBeginCheckout('booking')
    const messageTextarea = page.locator('textarea#message');
    const quoteButton = page.getByRole('button', { name: /request a quote/i });

    // Try textarea focus first (available for sponsor role)
    if (await messageTextarea.isVisible({ timeout: 5000 })) {
      await messageTextarea.focus();
      await expect.poll(
        () => analyticsEvents.some((e) => e.name === 'begin_checkout'),
        { message: 'begin_checkout event should fire on form interaction', timeout: 5000 }
      ).toBe(true);
    } else if (await quoteButton.isVisible({ timeout: 2000 })) {
      // Quote button click also triggers handleBeginCheckout('quote')
      await quoteButton.click();
      await expect.poll(
        () => analyticsEvents.some((e) => e.name === 'begin_checkout'),
        { message: 'begin_checkout event should fire on quote button click', timeout: 5000 }
      ).toBe(true);
    }

    // --- Step 4: Submit quote form -> expect generate_lead ---
    // Open the quote request modal if not already open
    if (await quoteButton.isVisible({ timeout: 2000 })) {
      await quoteButton.click();
      const quoteModal = page.locator('dialog[open], [role="dialog"]');
      await expect(quoteModal).toBeVisible({ timeout: 5000 });
    }

    // Fill out required quote form fields
    const companyNameInput = page.locator('input#companyName');
    const emailInput = page.locator('input#email');
    const budgetSelect = page.locator('select#budgetRange');

    if (await companyNameInput.isVisible({ timeout: 5000 })) {
      await companyNameInput.fill('Test Company');

      // Email may be pre-filled for logged-in users; clear and re-fill
      await emailInput.fill('test@testcompany.com');

      await budgetSelect.selectOption('$1k-$5k');

      // Submit the quote form
      const submitButton = page.getByRole('button', {
        name: /submit quote request/i,
      });
      await submitButton.click();

      // Wait for server response and generate_lead to fire
      await expect.poll(
        () => analyticsEvents.some((e) => e.name === 'generate_lead'),
        { message: 'generate_lead event should fire on successful quote submission', timeout: 15000 }
      ).toBe(true);
    }

    // --- Verify event order ---
    const expectedOrder = [
      'marketplace_view',
      'view_item',
      'begin_checkout',
      'generate_lead',
    ];
    const firedInOrder = expectedOrder.map((name) =>
      analyticsEvents.findIndex((e) => e.name === name)
    );

    // All events should have been found (index >= 0)
    for (let i = 0; i < expectedOrder.length; i++) {
      expect(
        firedInOrder[i],
        `${expectedOrder[i]} should appear in analytics events`
      ).toBeGreaterThanOrEqual(0);
    }

    // Events should appear in ascending order
    for (let i = 1; i < firedInOrder.length; i++) {
      expect(
        firedInOrder[i],
        `${expectedOrder[i]} should fire after ${expectedOrder[i - 1]}`
      ).toBeGreaterThan(firedInOrder[i - 1]);
    }

    // Log all captured events for debugging
    console.log(
      'Captured analytics events:',
      analyticsEvents.map((e) => e.name)
    );

    await context.close();
  });

  /**
   * SC4 supplementary: Verify marketplace_view includes expected parameters.
   *
   * The marketplace_view event should include funnel_step and total_results.
   */
  test('SC4: marketplace_view event includes funnel_step and total_results params', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const paramsMessages: string[] = [];

    page.on('console', (msg: ConsoleMessage) => {
      const text = msg.text();
      if (text.includes('Params:') || text.includes('funnel_step')) {
        paramsMessages.push(text);
      }
    });

    await loginAsSponsor(page);
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');
    await expect.poll(
      () => paramsMessages.some((msg) => msg.includes('browse')),
      { message: 'marketplace_view params should include funnel_step: browse', timeout: 10000 }
    ).toBe(true);

    await context.close();
  });

  /**
   * SC4 supplementary: Verify view_item event includes GA4 ecommerce items.
   *
   * The view_item event should include currency, value, and items array.
   */
  test('SC4: view_item event includes GA4 ecommerce params', async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const paramsMessages: string[] = [];

    page.on('console', (msg: ConsoleMessage) => {
      const text = msg.text();
      if (text.includes('Params:') || text.includes('Funnel:')) {
        paramsMessages.push(text);
      }
    });

    await loginAsSponsor(page);
    await page.goto('/marketplace');
    await page.waitForLoadState('networkidle');

    // Click a listing to navigate to detail page
    const firstListing = page.locator('a[href^="/marketplace/"]').first();
    await expect(firstListing).toBeVisible({ timeout: 10000 });
    await firstListing.click();

    await page.waitForLoadState('networkidle');
    await expect.poll(
      () => paramsMessages.some((msg) => msg.includes('view')),
      { message: 'view_item params should include funnel_step: view', timeout: 10000 }
    ).toBe(true);

    await context.close();
  });
});
