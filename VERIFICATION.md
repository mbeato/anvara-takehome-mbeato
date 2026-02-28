# Verification Guide

This guide walks through every v1.3 feature -- A/B testing, conversion tracking, and marketplace UX optimizations -- so a reviewer can verify the complete implementation without prior context.

**The analysis-implementation-verification loop:**

- **Analysis**: [CONVERSION_ANALYSIS.md](CONVERSION_ANALYSIS.md) identified eight friction points across the browse-to-book funnel, each with a testable hypothesis and GA4 measurement plan.
- **Implementation**: Phases 18--21 built the A/B framework (`ab-tests.ts` registry, `proxy.ts` edge middleware, `useABTest` hook), instrumented the full funnel (`track()` with automatic A/B variant and user type enrichment), and shipped UX changes driven by the analysis (publisher trust signals, audience metrics, availability indicators, CTA copy A/B test, related listings).
- **Verification**: This guide provides manual steps with expected output. Automated E2E tests in `tests/e2e/` cover the same scenarios programmatically.

---

## Prerequisites

1. Docker running (PostgreSQL):
   ```bash
   docker-compose up -d
   ```

2. Dev server running:
   ```bash
   pnpm dev
   ```
   This starts the frontend on `http://localhost:3847` and the backend on `http://localhost:4291`.

3. For automated tests (one-time setup):
   ```bash
   npx playwright install chromium
   ```

---

## 1. A/B Testing Verification

> Cross-reference: [CONVERSION_ANALYSIS.md](CONVERSION_ANALYSIS.md), Section 6 -- "A/B Test Plan: CTA Copy Variation"
>
> Automated tests: [`tests/e2e/ab-testing.spec.ts`](tests/e2e/ab-testing.spec.ts)

The A/B framework uses cookie-based variant assignment. The edge middleware (`proxy.ts`, re-exported as `middleware.ts`) sets an `ab_cta-copy` cookie on first visit. The `useABTest` hook reads this cookie client-side and fires an `ab_test_exposure` event once per session.

### 1.1 Two-Browser Variant Assignment

**Purpose**: Verify that separate sessions receive variant cookies independently.

1. Open Browser A (or an incognito window) and navigate to `http://localhost:3847/marketplace`.
2. Open DevTools > Application > Cookies > `localhost`.
3. Find the cookie `ab_cta-copy`. Note its value (`A` or `B`).
4. Verify cookie properties:
   - `Path`: `/`
   - `SameSite`: `Lax`
   - `Expires`: approximately 30 days from now
5. Open Browser B (a second incognito window) and navigate to `http://localhost:3847/marketplace`.
6. Check `ab_cta-copy` in Browser B. It will be `A` or `B` (may match Browser A -- that is valid with 50/50 random assignment).

**Expected**: Both browsers have the `ab_cta-copy` cookie with value `A` or `B`, path `/`, SameSite `Lax`, and a ~30-day expiry.

### 1.2 Cookie Clear Re-Randomization

**Purpose**: Verify that clearing cookies triggers fresh variant assignment.

1. In Browser A, delete all cookies (DevTools > Application > Cookies > Clear all).
2. Refresh `http://localhost:3847/marketplace`.
3. Check `ab_cta-copy` -- it should exist again with a valid value (`A` or `B`). The value may or may not differ from the original assignment.

**Expected**: New `ab_cta-copy` cookie is set after clearing and revisiting.

### 1.3 Debug URL Override

**Purpose**: Verify that URL parameters force a specific variant for QA.

1. Navigate to `http://localhost:3847/marketplace/1?ab_cta-copy=B`.
2. Open DevTools > Application > Session Storage > `localhost`.
3. Find `ab_override_cta-copy` with value `B`.
4. The detail page CTA button should show the variant B text: "Reach [N] Monthly Readers" (where N is the publisher's monthlyViews).
5. Navigate to `http://localhost:3847/marketplace/1?ab_cta-copy=A`.
6. Session Storage `ab_override_cta-copy` should now be `A`.
7. The CTA button should show the variant A text: "Book This Placement".

**Expected**: URL parameter `?ab_cta-copy=A` or `?ab_cta-copy=B` overrides the cookie value, stored in sessionStorage as `ab_override_cta-copy`.

### 1.4 Variant Rendering on Detail Page

**Purpose**: Verify the CTA button text changes based on variant.

1. Navigate to `http://localhost:3847/marketplace/1?ab_cta-copy=A`.
2. Scroll to the booking form. The CTA button reads **"Book This Placement"**.
3. Navigate to `http://localhost:3847/marketplace/1?ab_cta-copy=B`.
4. The CTA button reads **"Reach [N] Monthly Readers"** (e.g., "Reach 500K Monthly Readers" for a publisher with 500,000 monthly views). If the publisher has no `monthlyViews`, it falls back to "Book This Placement".

**Expected**: Variant A shows generic CTA, Variant B shows value-oriented CTA with audience reach.

---

## 2. Funnel Event Verification

> Cross-reference: [CONVERSION_ANALYSIS.md](CONVERSION_ANALYSIS.md), Section 5 -- "Measurement Plan Summary"
>
> Automated tests: [`tests/e2e/funnel-events.spec.ts`](tests/e2e/funnel-events.spec.ts)

In development mode, the `track()` function (`apps/frontend/lib/analytics.ts`) outputs structured analytics events to the browser console instead of sending to GA4. Every event is auto-enriched with `user_type` (authenticated/anonymous) and any active A/B variant cookies.

### Console Output Format

All events use this pattern:

```
[Analytics] event_name
  Params: {
    user_type: "authenticated",
    ab_cta_copy: "A",
    funnel_step: "browse",
    ...event-specific params
  }
  Funnel: browse
  Active A/B variants: { ab_cta_copy: "A" }
```

### 2.1 Marketplace View (Funnel Step: Browse)

1. Log in as sponsor (`sponsor@example.com` / `password`).
2. Open DevTools > Console.
3. Navigate to `http://localhost:3847/marketplace`.
4. Look for:

```
[Analytics] marketplace_view
  Params: {
    ab_cta_copy: "A",
    user_type: "authenticated",
    total_results: 20,
    page: 1,
    has_filters: false,
    funnel_step: "browse"
  }
  Funnel: browse
```

**Expected**: `marketplace_view` fires once on page load with `funnel_step: "browse"`, `total_results` (number of listings), and `page` (current page number).

### 2.2 Filter and Pagination Events (Micro-Conversions)

1. On the marketplace page, toggle "Available Only" on.
2. Console should show:

```
[Analytics] filter_used
  Params: {
    ...
    filter_type: "toggle",
    filter_key: "available",
    filter_value: true,
    funnel_step: "browse"
  }
```

3. Click to page 2 (if available after filtering).
4. Console should show:

```
[Analytics] pagination_used
  Params: {
    ...
    from_page: 1,
    to_page: 2,
    funnel_step: "browse"
  }
```

**Expected**: `filter_used` fires on toggle/filter changes. `pagination_used` fires on page navigation.

### 2.3 View Item (Funnel Step: View)

1. From the marketplace grid, click any listing card.
2. Wait for the detail page to load fully (the component waits for both data loading and role loading to resolve before firing).
3. Console should show:

```
[Analytics] view_item
  Params: {
    ...
    currency: "USD",
    value: 500,
    items: [{ item_id: "...", item_name: "...", price: 500, currency: "USD", item_category: "...", item_brand: "..." }],
    publisher_verified: true,
    publisher_category: "Technology",
    publisher_monthly_views: 100000,
    placement_count: 2,
    funnel_step: "view"
  }
  Funnel: view
```

**Expected**: `view_item` fires once on detail page load with GA4 ecommerce `items` array, publisher metadata, and `funnel_step: "view"`.

### 2.4 A/B Test Exposure

On the same detail page load, the `useABTest('cta-copy')` hook fires an exposure event:

```
[Analytics] ab_test_exposure
  Params: {
    ...
    experiment_name: "cta-copy",
    variant: "A",
    funnel_step: "browse"
  }
```

**Expected**: `ab_test_exposure` fires once per session per experiment (ref-guarded to prevent duplicates).

### 2.5 Begin Checkout (Funnel Step: Engage)

1. On the detail page, click into the booking message textarea (or click "Request a Quote" for unavailable listings).
2. Console should show:

```
[Analytics] begin_checkout
  Params: {
    ...
    currency: "USD",
    value: 500,
    items: [{ item_id: "...", item_name: "...", price: 500, currency: "USD", ... }],
    checkout_trigger: "booking",
    funnel_step: "engage"
  }
```

**Expected**: `begin_checkout` fires once on first form interaction (textarea focus or quote button click). The `checkout_trigger` indicates which path (`"booking"` or `"quote"`). Subsequent interactions do not re-fire.

### 2.6 Purchase or Generate Lead (Funnel Step: Convert)

**Booking path** (available listing, logged in as sponsor):
1. Fill in the message textarea and click the CTA button.
2. On success, console should show:

```
[Analytics] purchase
  Params: {
    ...
    transaction_id: "...",
    currency: "USD",
    value: 500,
    items: [{ item_id: "...", item_name: "...", price: 500, currency: "USD", ... }],
    funnel_step: "convert"
  }
```

**Quote path** (click "Request a Quote"):
1. Fill out the quote form (company name, email, budget range).
2. Submit. On success, console should show:

```
[Analytics] generate_lead
  Params: {
    ...
    currency: "USD",
    value: 500,
    items: [{ item_id: "...", item_name: "...", price: 500, currency: "USD", ... }],
    funnel_step: "convert"
  }
```

**Expected**: `purchase` fires on successful booking. `generate_lead` fires on successful quote submission. Both include GA4 ecommerce `items` array and `funnel_step: "convert"`.

---

## 3. Marketplace UX Verification

> Cross-reference: [CONVERSION_ANALYSIS.md](CONVERSION_ANALYSIS.md), Section 3 -- Friction Points FP-1 through FP-7

These UX changes were driven by the friction points identified in the conversion analysis.

### 3.1 Enriched Marketplace Cards (FP-1, FP-5)

1. Navigate to `http://localhost:3847/marketplace`.
2. Cards should display:
   - Publisher audience reach (e.g., "100K monthly views") when available
   - Publisher category badge (e.g., "Technology", "Video")
   - **Popular** badge on listings with at least 1 previous booking (`_count.placements > 0`)
   - Price prominently displayed

### 3.2 Available Only Filter (FP-2)

1. On the marketplace grid, locate the "Available Only" toggle in the filter bar.
2. Toggle it on. The grid should show only listings where `isAvailable: true`.
3. Booked listings should disappear. Toggle off to restore all listings.

### 3.3 Publisher Trust Signals on Detail Page (FP-3)

1. Click any listing to open the detail page.
2. The publisher section should show:
   - Monthly views (formatted, e.g., "500K")
   - Subscriber count (formatted, e.g., "120K")
   - Category badge
   - "Verified" badge (for verified publishers)

### 3.4 Availability Indicators (FP-6)

1. On the marketplace grid, cards show contextual availability:
   - **Available** -- listing has no booking history
   - **Available . In Demand** -- listing is available and has previous bookings
   - **Currently Booked** -- listing is not available
2. These indicators are pinned to the bottom of each card.

### 3.5 Related Listings (FP-7)

1. On any detail page, scroll to the bottom.
2. A "More from [Publisher Name]" section should show up to 3 other listings from the same publisher.
3. If the publisher has only 1 listing, similar listings by type may be shown instead.

---

## 4. Code Quality

Run these commands from the repo root:

```bash
pnpm typecheck
```

**Expected**: Clean exit (0 errors). TypeScript strict mode across the entire monorepo.

```bash
pnpm lint
```

**Expected**: Clean exit (no warnings or errors). ESLint 9 flat config with consistent rules.

---

## 5. Mobile Responsiveness (375px)

> Automated tests: [`tests/e2e/mobile-responsive.spec.ts`](tests/e2e/mobile-responsive.spec.ts)

### Manual Check

1. Open DevTools and set the viewport to **375x667** (iPhone SE).
2. Navigate to `http://localhost:3847/marketplace`.
3. Verify:
   - Cards render in a single column
   - No horizontal scrollbar appears
   - Card content (name, price, badges, publisher info) is readable and not clipped
4. Click a listing to open the detail page.
5. Verify:
   - Publisher info section wraps correctly
   - Booking form textarea and CTA button fit within viewport
   - Related listings section renders without overflow

**Expected**: All marketplace pages render correctly at 375px with no horizontal overflow. The `scrollWidth` of the `<html>` element should equal or be less than `clientWidth`.

---

## Automated Verification (Full Suite)

Run all E2E tests with a single command:

```bash
pnpm e2e
```

This executes the Playwright test suite (`tests/e2e/playwright.config.ts`) covering:

| Test File | What It Verifies |
|-----------|-----------------|
| [`tests/e2e/ab-testing.spec.ts`](tests/e2e/ab-testing.spec.ts) | Cookie assignment, re-randomization, debug URL overrides |
| [`tests/e2e/funnel-events.spec.ts`](tests/e2e/funnel-events.spec.ts) | Full funnel walk: marketplace_view, view_item, begin_checkout, generate_lead |
| [`tests/e2e/mobile-responsive.spec.ts`](tests/e2e/mobile-responsive.spec.ts) | No horizontal overflow at 375px on marketplace and detail pages |

**Prerequisites for automated tests**: Dev server running (`pnpm dev`) and Playwright chromium installed (`npx playwright install chromium`).
