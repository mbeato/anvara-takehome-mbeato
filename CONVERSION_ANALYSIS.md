# Conversion Analysis: Anvara Marketplace

## 1. Executive Summary

The Anvara marketplace provides a complete browse-to-book funnel across four stages: grid browsing, detail viewing, form engagement, and booking or quote conversion. The flow works mechanically -- sponsors can discover listings, view details, and submit bookings or quote requests. However, the current UX fails to leverage available data, provide decision-making context, or build the trust signals that B2B buyers need to justify advertising spend in the $150--$5,000/month range. The result is a flat experience where every listing looks structurally identical and nothing compels action.

The core insight is that **this is not a data problem -- it is a presentation problem.** The backend already returns rich publisher and listing data that the frontend silently discards. The list API endpoint (`GET /api/ad-slots` in `apps/backend/src/routes/adSlots.ts`, lines 76-79) returns `publisher.category`, `publisher.monthlyViews`, and `_count.placements` for every listing. The detail API (`GET /api/ad-slots/:id`, line 176) returns the full Publisher object including `monthlyViews`, `subscriberCount`, `category`, `isVerified`, and `bio`. But the frontend `AdSlot` type in `apps/frontend/lib/types.ts` (line 155) defines `publisher` as only `{ id: string; name: string; website?: string | null }`. The data is fetched, transmitted over the network, and then thrown away by the TypeScript type system.

This document identifies **eight specific friction points** across all funnel stages, each grounded in actual component code, API responses, and data field references. Each friction point includes a testable hypothesis in "If X, then Y because Z" format, a proposed solution mapped to specific requirement IDs (CONV-01 through CONV-10, TRCK-01 through TRCK-12), and a GA4 measurement plan using the analytics infrastructure built in Phase 18 (`track()`, `useTrackView`, `toGA4Item()`, `useABTest`, and the `EXPERIMENTS` registry).

---

## 2. Funnel Overview

```
 ┌─────────────────────────────────────────────────────────────────┐
 │  Stage 1: BROWSE (Marketplace Grid)                            │
 │                                                                │
 │  Components:                                                   │
 │    MarketplacePage    apps/frontend/app/marketplace/page.tsx    │
 │    AdSlotGrid         .../marketplace/components/              │
 │                         ad-slot-grid.tsx                        │
 │    MarketplaceFilters .../marketplace/components/              │
 │                         marketplace-filters.tsx                 │
 │    PaginationControls .../marketplace/components/              │
 │                         pagination-controls.tsx                 │
 │    FilterBar          apps/frontend/app/components/            │
 │                         filter-bar.tsx                          │
 │                                                                │
 │  Current tracking:  marketplace_click (on card click)          │
 │  Missing tracking:  marketplace_view (TRCK-01)                 │
 │                                                                │
 │  20 listings shown (12 per page), 4 booked, 16 available       │
 ├─────────────────────────────────────────────────────────────────┤
 │                    ▼ Card click (drop-off: HIGH)               │
 ├─────────────────────────────────────────────────────────────────┤
 │  Stage 2: VIEW (Detail Page)                                   │
 │                                                                │
 │  Components:                                                   │
 │    AdSlotPage         apps/frontend/app/marketplace/           │
 │                         [id]/page.tsx                           │
 │    AdSlotDetail       .../[id]/components/                     │
 │                         ad-slot-detail.tsx                      │
 │    QuoteRequestButton .../[id]/components/                     │
 │                         quote-request-button.tsx                │
 │    QuoteRequestForm   .../[id]/components/                     │
 │                         quote-request-form.tsx                  │
 │                                                                │
 │  Current tracking:  none                                       │
 │  Missing tracking:  view_item (TRCK-02)                        │
 ├─────────────────────────────────────────────────────────────────┤
 │                    ▼ Form interaction (drop-off: HIGH)         │
 ├─────────────────────────────────────────────────────────────────┤
 │  Stage 3: ENGAGE (Form Interaction)                            │
 │                                                                │
 │  Components:                                                   │
 │    Booking form in AdSlotDetail (textarea + CTA button)        │
 │    QuoteRequestForm   .../[id]/components/                     │
 │                         quote-request-form.tsx                  │
 │                                                                │
 │  Current tracking:  quote_request_attempt, quote_request       │
 │  Missing tracking:  begin_checkout (TRCK-03)                   │
 ├─────────────────────────────────────────────────────────────────┤
 │                    ▼ Submit (drop-off: MODERATE)               │
 ├─────────────────────────────────────────────────────────────────┤
 │  Stage 4: CONVERT (Booking/Quote Completion)                   │
 │                                                                │
 │  Components:                                                   │
 │    handleBooking()    in ad-slot-detail.tsx (line 77)          │
 │    requestQuote       server action in                         │
 │                         quote-request-form.tsx                  │
 │                                                                │
 │  Current tracking:  quote_request (partial, no ecommerce)      │
 │  Missing tracking:  purchase, generate_lead with GA4           │
 │                     ecommerce params (TRCK-04)                 │
 └─────────────────────────────────────────────────────────────────┘
```

**Estimated drop-off analysis:** The highest drop-off is likely at **Browse to View** (cards lack differentiation -- a $150/mo footer banner looks structurally identical to a $5,000/mo video integration) and at **View to Engage** (the detail page provides no trust signals, no audience context, and no reason to believe the listed price represents good value). The infrastructure to reduce both drop-offs exists in the codebase; it simply is not wired to the UI.

---

## 3. Friction Points

### FP-1: Marketplace Cards Lack Differentiating Information

**Problem:** Every card in `AdSlotGrid` (`apps/frontend/app/marketplace/components/ad-slot-grid.tsx`) renders the same six fields: `slot.name` (line 39), `slot.type` as a color-coded badge (line 41), `slot.publisher.name` (line 48), `slot.description` truncated to two lines (line 52), `slot.isAvailable` (line 57-59), and `slot.basePrice` formatted as "$X,XXX/mo" (line 62). A $150/mo blog footer ad looks structurally identical to a $5,000/mo CodeTube sponsored integration reaching 500K monthly viewers. Sponsors scanning the grid have no quick way to assess relative value, audience size, or listing popularity.

**Root Cause:** The list API endpoint (`GET /api/ad-slots` in `apps/backend/src/routes/adSlots.ts`, lines 76-79) already includes `publisher.category`, `publisher.monthlyViews`, and `_count.placements` in every response via the Prisma `include` clause:

```typescript
const include = {
  publisher: { select: { id: true, name: true, category: true, monthlyViews: true } },
  _count: { select: { placements: true } },
};
```

But the frontend `AdSlot` type in `apps/frontend/lib/types.ts` (line 155) defines `publisher` as only `{ id: string; name: string; website?: string | null }`. The data is fetched, serialized to JSON, transmitted over the network, and then silently discarded by the TypeScript type system. There is no `_count` field on the `AdSlot` interface at all.

**Hypothesis:** If we display publisher audience reach (`monthlyViews` formatted as "50K monthly views"), publisher category badge, and a "Popular" indicator (when `_count.placements > 0`) on each marketplace card, then card-to-detail click-through rate will increase by 15--25%, because sponsors can quickly identify high-value, proven listings without visiting every detail page.

**Proposed Solution:**
- Extend `AdSlot.publisher` type in `apps/frontend/lib/types.ts` to include `monthlyViews?: number` and `category?: string` (CONV-01)
- Add `_count?: { placements: number }` to the `AdSlot` interface (CONV-02)
- Display a "Popular" badge on cards where `_count.placements > 0` (CONV-02)
- Format and display `monthlyViews` as human-readable text (e.g., "100K monthly views" for Dev Blog Daily, "500K monthly views" for CodeTube) (CONV-01)
- Improve visual hierarchy: price more prominent, publisher name grouped with category badge (CONV-04)

**Measurement:**
- Track enriched `marketplace_click` event (already exists in `apps/frontend/lib/analytics.ts`, line 71) with additional params: `has_audience_metrics: true/false`, `is_popular: true/false`
- Compare click-through rate before/after: `marketplace_click` count / `marketplace_view` impressions (requires TRCK-01)
- A/B testable: Control (current card layout) vs. Treatment (enriched card with audience metrics)

---

### FP-2: No Availability Filtering

**Problem:** The marketplace grid displays all 20 listings including the 4 that are booked (`isAvailable: false` -- In-Article Native Ad, Featured Sponsor Slot, Pre-roll Video Ad 30s, Mobile Interstitial). Sponsors waste clicks on unavailable inventory, encountering a dead-end experience when they see "Currently Booked" on the detail page with no actionable path forward. The booked listings appear in the same visual hierarchy as available ones.

**Root Cause:** `MarketplaceFilters` (`apps/frontend/app/marketplace/components/marketplace-filters.tsx`) defines a `filterConfig` object (line 23) with `dropdowns` and `sortOptions`, but the configuration has no `toggles` property. The reusable `FilterBar` component (`apps/frontend/app/components/filter-bar.tsx`) already supports toggle filters: `ToggleConfig` is defined at lines 15-18, the rendering logic is at lines 161-176 (checkbox input with label), and `FilterBarValues.toggles` is a `Record<string, boolean>` (line 36). The backend already supports the `?available=true` query parameter (`adSlots.ts` line 70: `...(available === 'true' && { isAvailable: true })`). The entire pipeline -- UI component, URL param handling, and backend filtering -- exists but is not wired together.

**Hypothesis:** If we add an "Available Only" toggle to the marketplace filters using the existing `FilterBarConfig.toggles` pattern and backend `?available=true` support, then browse-to-view conversion rate will increase by 10--15%, because sponsors will only see actionable listings they can actually book.

**Proposed Solution:**
- Add toggle configuration to `MarketplaceFilters.filterConfig`: `toggles: [{ key: 'available', label: 'Available Only' }]` (CONV-09)
- In `handleChange`, when `next.toggles.available` is true, append `available=true` to the URL search params
- No backend change needed -- `?available=true` already works

**Measurement:**
- Track `filter_used` event with params `{ filter_type: 'toggle', filter_key: 'available', filter_value: 'true' }` (TRCK-05)
- Measure: percentage of sessions using the toggle, and browse-to-view conversion rate for toggle-on vs. toggle-off sessions

---

### FP-3: Detail Page Missing Publisher Trust Signals

**Problem:** The detail page (`apps/frontend/app/marketplace/[id]/components/ad-slot-detail.tsx`) shows publisher name (line 164) and website link (line 170) only. A sponsor evaluating whether to spend $500--$5,000/month has no data to assess publisher credibility: no audience size, no subscriber count, no verification status, no category context. The decision environment is information-poor for a B2B purchasing decision of this magnitude.

**Root Cause:** The detail API (`GET /api/ad-slots/:id` in `adSlots.ts`, line 176) returns `publisher: true`, which includes the full Publisher object: `monthlyViews`, `subscriberCount`, `category`, `bio`, `avatar`, `isVerified`, and `email`. But `AdSlotDetail` only destructures and renders `publisher.name` and `publisher.website`. The full publisher fields are fetched from the database, serialized, and sent to the client, but never displayed.

For example, CodeTube's detail page could show "500K monthly views, 120K subscribers, Video, Verified Publisher" -- all fields already in the API response. Instead, the sponsor sees only "by CodeTube" with a website link.

**Hypothesis:** If we add a structured publisher info section showing audience metrics (`monthlyViews` and `subscriberCount` formatted as human-readable numbers), category tag, and a "Verified Publisher" badge on the detail page, then detail-to-booking conversion rate will increase by 20--30%, because sponsors will have the trust signals needed to justify their investment decision.

**Proposed Solution:**
- Add a publisher info card/section below the listing header with: `monthlyViews` (formatted), `subscriberCount` (formatted), `category` badge, `isVerified` badge (CONV-05, CONV-03)
- Reference seed data for realistic rendering: CodeTube shows "500K monthly views, 120K subscribers, Video, Verified"; Dev Blog Daily shows "100K monthly views, 15K subscribers, Technology, Verified"
- Backend change needed for the **list** endpoint: add `isVerified: true, subscriberCount: true` to the publisher select clause in `adSlots.ts` line 77 (the detail endpoint already returns everything)

**Measurement:**
- Track `view_item` event (TRCK-02) with enriched params including `publisher_verified: true/false`, `publisher_category: string`, `publisher_monthly_views: number`
- Measure: conversion rate (bookings / detail views) segmented by `publisher_verified` to validate trust signal impact

---

### FP-4: Weak CTA Copy and Missing Value Proposition

**Problem:** The primary CTA in `AdSlotDetail` (`ad-slot-detail.tsx`, line 250) reads "Book This Placement" -- transactional and generic. It tells the user what to do but not what they will get. For non-sponsors, the disabled state reads "Only sponsors can request placements" (line 263) or "Log in as a sponsor to request this placement" (line 264) -- clinical and uninviting. There is no microcopy connecting the action to the value (audience reach, subscriber access). The section heading is "Request This Placement" (line 216), which is equally generic.

**Root Cause:** The CTA was implemented as a functional element without product copywriting. No dynamic content is injected -- the publisher's audience metrics (`monthlyViews`, `subscriberCount`) are not referenced in the CTA area even though they are available in the API response. The booking form area presents a text area and a button with no value summary.

**Hypothesis:** If we change the CTA copy to value-oriented text (e.g., "Reach 500K Monthly Viewers") with supporting microcopy (e.g., "Secure your spot on CodeTube's Video audience"), then booking initiation rate will increase by 10--20%, because sponsors see the concrete value they are purchasing rather than an abstract "placement."

**Proposed Solution:**
- Replace "Book This Placement" with dynamic value-oriented copy referencing `publisher.monthlyViews` (CONV-06)
- Add microcopy below CTA: "Secure your spot on {publisher.name}'s {category} audience"
- This is the primary candidate for the A/B test (ABTS-07): **Control** = "Book This Placement" (current), **Variant** = "Reach {N} Monthly Readers" (dynamic, value-oriented)
- Implementation uses `useABTest('cta-copy')` from Phase 18 infrastructure (`apps/frontend/app/hooks/use-ab-test.ts`)

**Measurement:**
- Track `begin_checkout` event (TRCK-03) on first form interaction (textarea focus or CTA click)
- Compare `begin_checkout` rate between CTA variants via the `ab_cta_copy` cookie value
- A/B test exposure tracked via `ab_test_exposure` event (fires once per session when variant first renders, ref-guarded via `useABTest` hook)

---

### FP-5: No Social Proof or Popularity Signals

**Problem:** All 20 listings appear equally viable on the grid -- there is no indication which listings are popular, frequently booked, or in demand. Cards in `AdSlotGrid` (`ad-slot-grid.tsx`) have identical visual weight. On the detail page (`ad-slot-detail.tsx`), no booking history context is shown despite the API returning full placement data.

**Root Cause:** The list API returns `_count.placements` (number of times a slot has been booked) via the Prisma include clause (`adSlots.ts`, line 78: `_count: { select: { placements: true } }`), but the frontend `AdSlot` type has no `_count` field and the grid component never reads this data. The detail API returns the full `placements[]` array with campaign data (`adSlots.ts`, lines 177-183), but `AdSlotDetail` does not display it. Both represent concrete social proof signals from real booking activity.

**Hypothesis:** If we add a "Popular" badge on grid cards where `_count.placements > 0` and show "{placements.length} previous campaigns" on the detail page, then click-through and booking rates will increase by 10--15%, because social proof reduces perceived risk in B2B purchasing decisions.

**Proposed Solution:**
- Grid cards: Show "Popular" badge when `_count.placements > 0` (CONV-02)
- Detail page: Show "{placements.length} previous campaigns" in the publisher/listing info section (CONV-05)
- Both require extending the frontend `AdSlot` type in `apps/frontend/lib/types.ts` to include `_count?: { placements: number }`

**Measurement:**
- Track `marketplace_click` with `is_popular: true/false` param to measure popular-card vs. non-popular-card click-through rates
- Track `view_item` with `placement_count: number` param to correlate social proof signals with booking conversion
- Measure: click-through rate uplift for "Popular" cards vs. non-popular cards

---

### FP-6: No B2B-Appropriate Scarcity Framing

**Problem:** Available slots show a green "Available" text (or "● Available" on the detail page, `ad-slot-detail.tsx` line 194) with no context. Booked slots show "Booked" on cards (`ad-slot-grid.tsx`, line 59) or "○ Currently Booked" on the detail page (line 194). There is no signal about demand level or inventory scarcity. In a B2B context, decision-makers need professional framing that communicates market validation without resorting to consumer pressure tactics.

**CONSTRAINT: Consumer urgency patterns (countdown timers, "Only N left!", FOMO language) are explicitly OUT OF SCOPE per locked project decision. All scarcity framing must be B2B-appropriate -- signaling market validation rather than artificial pressure.**

**Hypothesis:** If we enhance the availability indicator with demand-based context -- showing "In Demand" for listings with `_count.placements > 0` and "Frequently Booked Publisher" when the publisher has multiple booked slots -- then booking urgency will increase by 5--10%, because B2B buyers respond to professional signals of market validation rather than artificial scarcity.

**Proposed Solution:**
- Replace binary Available/Booked with contextual labels: "Available -- In Demand" (when `_count.placements > 0`), "Available" (when no placement history), "Currently Booked" (unchanged) (CONV-07)
- On detail page: "This listing has been booked {N} times" as factual social proof, not pressure copy
- Grounded in real data: only uses `_count.placements` from the existing API response -- no fabricated scarcity signals

**Measurement:**
- Track `view_item` with `scarcity_signal: 'in_demand' | 'none'` param
- Track `begin_checkout` segmented by scarcity signal presence
- Measure: booking rate for "In Demand" listings vs. neutral listings to validate whether B2B scarcity framing impacts conversion

---

### FP-7: No Related Listings / Cross-Sell on Detail Page

**Problem:** If a sponsor views a listing and decides not to book -- price too high, wrong format, wrong audience -- the only navigation option is the "Back to Marketplace" link (`ad-slot-detail.tsx`, line 154). This is a full funnel reset. There is no path to similar alternatives from the current page, losing engaged users who have buying intent but have not found the right match.

**Root Cause:** `AdSlotDetail` (`apps/frontend/app/marketplace/[id]/components/ad-slot-detail.tsx`) renders only the single listing with no awareness of other inventory. No "related listings" query is made. The component receives only the `id` prop (line 32) and fetches a single ad slot.

**Hypothesis:** If we add a "More from {publisher.name}" or "Similar Listings" section at the bottom of the detail page showing 3 related listings, then bounce-to-exit rate from the detail page will decrease by 15--20%, because users with intent but no match will find alternatives without restarting their search.

**Proposed Solution:**
- Add section below the booking form showing 3 related listings (CONV-10)
- **Strategy 1:** "More from {publisher.name}" -- query existing `GET /api/ad-slots?publisherId={id}&limit=3` (example: viewing a CodeTube slot shows 4 other CodeTube listings)
- **Strategy 2:** "Similar {type} listings" -- query existing `GET /api/ad-slots?type={type}&limit=3`
- **Recommendation:** Show "More from this publisher" first (builds publisher trust); fall back to "Similar listings" if publisher has only 1 slot
- No new API endpoint needed -- reuse existing list endpoint with filters

**Measurement:**
- Track `marketplace_click` from related listings section with `click_source: 'related_listings'` param
- Measure: percentage of detail page sessions that click a related listing vs. "Back to Marketplace"
- Measure: whether related-listing clickers convert at a higher rate than back-to-grid browsers

---

### FP-8: Missing Funnel Entry and Stage Tracking

**Problem:** The analytics infrastructure from Phase 18 provides `track()` (`apps/frontend/lib/analytics.ts`), `useTrackView` (`apps/frontend/app/hooks/use-track-view.ts`), and `toGA4Item()` (`apps/frontend/lib/ab-tests.ts`, line 38) -- but the actual funnel events are not yet instrumented. There is no `marketplace_view` on grid mount, no `view_item` on detail page load, no `begin_checkout` on form interaction, and no ecommerce parameters on conversion events. Without these, we cannot measure the funnel or validate any UX changes from FP-1 through FP-7.

**Root Cause:** Phase 18 built the infrastructure: hooks (`useTrackView` for mount-based view tracking with StrictMode double-fire protection via `useRef` guard, `useABTest` for cookie-based variant assignment), helpers (`toGA4Item()` for GA4 ecommerce item formatting, `getActiveVariants()` for A/B variant enrichment), and the core `track()` function with automatic `user_type` and A/B variant auto-attach. Phase 19 (this document) defines what to track. Phase 20 will implement the actual tracking calls. The funnel has the pipes but no water flowing through them.

**Hypothesis:** If we instrument all four funnel stages with GA4 events -- including standard ecommerce events where applicable -- then we will establish baseline conversion rates that enable data-driven optimization and A/B test validation for all other friction points.

**Proposed Solution:**
- `marketplace_view` (custom event) fires on grid mount via `useTrackView('marketplace_view', { total_results, page, has_filters })` in `MarketplacePage` or `AdSlotGrid` (TRCK-01)
- `view_item` (GA4 standard) fires in `AdSlotDetail` when both `loading === false` and `roleLoading === false` resolve, enriched with `toGA4Item(adSlot)` ecommerce params (TRCK-02)
- `begin_checkout` (GA4 standard) fires on first focus/interaction with booking form textarea (`ad-slot-detail.tsx`, line 235) or quote form, enriched with `toGA4Item(adSlot)` (TRCK-03)
- `purchase` (GA4 standard) fires on `handleBooking` success (`ad-slot-detail.tsx`, line 101) and `generate_lead` (GA4 standard) fires on `requestQuote` success (`quote-request-form.tsx`, line 71), both enriched with `toGA4Item()` ecommerce params (TRCK-04)
- `filter_used` and `pagination_used` (custom events) fire as micro-conversion events from `MarketplaceFilters.handleChange` and `PaginationControls.navigateToPage` (TRCK-05)
- All events include `funnel_step` metadata (TRCK-08) and `user_type` param via the `track()` enrichment (TRCK-10)

**Measurement:**
- This IS the measurement -- these events create the funnel visualization in GA4
- Baseline metrics to establish: `marketplace_view` to `marketplace_click` rate, `view_item` to `begin_checkout` rate, `begin_checkout` to `purchase`/`generate_lead` rate
- Funnel report in GA4: Explorations > Funnel Analysis using these events as sequential steps

---

## 4. Technical Prerequisites

Before UX improvements can be implemented, the following technical changes are required:

### Frontend Type Extension (`apps/frontend/lib/types.ts`)

The `AdSlot` interface (line 141) needs two additions:

1. **Extend `publisher` type** from:
   ```typescript
   publisher?: { id: string; name: string; website?: string | null };
   ```
   To:
   ```typescript
   publisher?: {
     id: string;
     name: string;
     website?: string | null;
     monthlyViews?: number;
     subscriberCount?: number;
     category?: string;
     isVerified?: boolean;
   };
   ```

2. **Add `_count` field:**
   ```typescript
   _count?: { placements: number };
   ```

### Backend Query Adjustment (`apps/backend/src/routes/adSlots.ts`)

The list endpoint publisher select (line 77) currently selects:
```typescript
publisher: { select: { id: true, name: true, category: true, monthlyViews: true } }
```

Must add `isVerified: true` and `subscriberCount: true`:
```typescript
publisher: { select: { id: true, name: true, category: true, monthlyViews: true, isVerified: true, subscriberCount: true } }
```

The detail endpoint already returns `publisher: true` (full publisher object) -- no change needed.

### Phase 18 Infrastructure Available

All of these are built and ready to use:

| Utility | File | Purpose | Status |
|---------|------|---------|--------|
| `track()` | `apps/frontend/lib/analytics.ts` | Core event tracking with A/B variant auto-attach and `user_type` enrichment | Ready |
| `useTrackView(eventName, params)` | `apps/frontend/app/hooks/use-track-view.ts` | Fire event once on mount, StrictMode-safe via `useRef` guard | Ready |
| `toGA4Item(adSlot)` | `apps/frontend/lib/ab-tests.ts` (line 38) | Convert AdSlot to GA4 ecommerce item schema (`item_id`, `item_name`, `price`, `currency`, `item_category`, `item_brand`) | Ready |
| `useABTest(experimentName)` | `apps/frontend/app/hooks/use-ab-test.ts` | Returns `{ variant, isLoading, experimentName }` with cookie persistence and exposure tracking | Ready |
| `EXPERIMENTS` registry | `apps/frontend/lib/ab-tests.ts` (line 14) | Array of `ExperimentConfig` -- currently empty, Phase 21 adds `cta-copy` experiment | Ready |
| `getActiveVariants()` | `apps/frontend/lib/ab-tests.ts` (line 76) | Reads all `ab_*` cookies for analytics enrichment | Ready |
| `weightedRandom()` | `apps/frontend/lib/ab-tests.ts` (line 56) | Weighted random variant selection for percentage-based splits | Ready |
| `proxy.ts` | `apps/frontend/proxy.ts` | Edge function that sets A/B cookies before page render (server-side variant assignment) | Ready |

---

## 5. Measurement Plan Summary

| GA4 Event | Type | Funnel Step | Fires When | Key Params | Validates |
|-----------|------|-------------|------------|------------|-----------|
| `marketplace_view` | Custom | Browse (1) | Grid page mount via `useTrackView` | `total_results`, `page`, `has_filters` | Funnel entry baseline |
| `marketplace_click` | Custom | Browse (1) | Card click (existing, `analytics.ts` line 71) | `ad_slot_id`, `position`, `is_popular`, `has_audience_metrics` | Card enrichment impact (FP-1, FP-5) |
| `filter_used` | Custom | Browse (micro) | Filter/toggle/sort change in `MarketplaceFilters` | `filter_type`, `filter_key`, `filter_value` | Availability toggle usage (FP-2) |
| `pagination_used` | Custom | Browse (micro) | Page navigation in `PaginationControls` | `from_page`, `to_page` | Browse depth engagement |
| `view_item` | GA4 Standard | View (2) | Detail page loaded (both `loading` and `roleLoading` resolved) | `item_id`, `item_name`, `price`, `currency`, `publisher_verified`, `publisher_category`, `publisher_monthly_views`, `placement_count` | Detail page reach, trust signal impact (FP-3) |
| `begin_checkout` | GA4 Standard | Engage (3) | First form interaction (textarea focus or CTA click) | `item_id`, `value`, `currency`, `cta_variant`, GA4 items via `toGA4Item()` | CTA effectiveness (FP-4), form engagement |
| `purchase` | GA4 Standard | Convert (4) | Booking success (`handleBooking` in `ad-slot-detail.tsx`) | `transaction_id`, `value`, `currency`, GA4 items array via `toGA4Item()` | Booking macro-conversion |
| `generate_lead` | GA4 Standard | Convert (4) | Quote request success (`requestQuote` action) | `value`, `currency`, GA4 items array via `toGA4Item()` | Quote macro-conversion |
| `ab_test_exposure` | Custom | Any (varies) | First variant render via `useABTest` hook (ref-guarded, `use-ab-test.ts` line 51) | `experiment_name`, `variant`, `funnel_step` | A/B test sample sizes and variant distribution |

**Automatic enrichment on all events** (via `track()` in `analytics.ts`):
- `user_type`: `"authenticated"` or `"anonymous"` (derived from `better-auth.session_token` cookie)
- Active A/B variant cookies: all `ab_*` cookie values attached as flat params (e.g., `ab_cta_copy: "B"`)

---

## 6. A/B Test Plan: CTA Copy Variation

This section details the planned A/B test for requirement ABTS-07.

| Property | Value |
|----------|-------|
| **Experiment Name** | `cta-copy` |
| **Location** | `AdSlotDetail` component (`apps/frontend/app/marketplace/[id]/components/ad-slot-detail.tsx`), primary booking CTA button (line 250) |
| **Control (Variant A)** | "Book This Placement" (current copy) |
| **Treatment (Variant B)** | "Reach {monthlyViews} Monthly Readers" (dynamic, value-oriented -- e.g., "Reach 500K Monthly Viewers" for CodeTube) |
| **Traffic Split** | 50/50 (configured via `EXPERIMENTS` registry weights `[50, 50]`) |
| **Assignment** | Server-side via `proxy.ts` sets `ab_cta_copy` cookie on first visit; `useABTest('cta-copy')` reads it client-side as runtime authority |
| **Cookie** | `ab_cta-copy` (prefixed per-test cookie, 30+ day expiry, per ABTS-02) |
| **Primary Metric** | `begin_checkout` rate: percentage of `view_item` sessions that fire `begin_checkout` |
| **Secondary Metrics** | `purchase` / `generate_lead` rate; time from `view_item` to `begin_checkout` |
| **Exposure Tracking** | `ab_test_exposure` event fires once per session when variant first renders (ref-guarded via `exposureTracked` ref in `useABTest` hook, `use-ab-test.ts` line 15) |
| **Implementation Phase** | Phase 21 adds `{ name: 'cta-copy', variants: ['A', 'B'], weights: [50, 50], description: 'Detail page CTA text variation' }` to `EXPERIMENTS` registry in `apps/frontend/lib/ab-tests.ts` |
| **Debug Mode** | Force variant via URL: `?ab_cta-copy=B` (per ABTS-06, handled by `useABTest` hook `sessionStorage` override, `use-ab-test.ts` lines 18-26) |
| **Verification Protocol** | Two-browser test: Browser 1 gets variant A, Browser 2 gets variant B. Clear cookies to re-randomize. Inspect `ab_cta-copy` cookie value matches rendered CTA text. Verify `ab_test_exposure` event fires in console (dev mode structured output from `track()`) |

**Why this test matters:** The CTA is the final conversion trigger. Testing value-oriented copy ("what you get") vs. action-oriented copy ("what you do") directly measures whether making the value proposition explicit at the point of decision increases booking initiation. This is the highest-leverage single change because it targets the narrowest part of the funnel.

---

## 7. Implementation Roadmap

| Phase | What It Delivers | Friction Points Addressed | Key Requirements |
|-------|-----------------|--------------------------|------------------|
| **Phase 19** (this document) | Analysis, hypotheses, measurement plan | All (FP-1 through FP-8) -- analysis only | CONV-08 |
| **Phase 20** | GA4 funnel event instrumentation | FP-8 (tracking), measurement infrastructure for all others | TRCK-01 through TRCK-06, TRCK-08, TRCK-10, TRCK-12 |
| **Phase 21** | UX improvements + live A/B test | FP-1 through FP-7 (implementation), ABTS-07 | CONV-01 through CONV-07, CONV-09, CONV-10, ABTS-07 |
| **Phase 22** | Verification protocol | End-to-end validation, A/B test verification | ABTS-10 |

**Dependencies:** Phase 20 depends on Phase 19 (needs event definitions). Phase 21 depends on Phase 20 (needs baseline metrics infrastructure) and on Phase 19 (needs friction point analysis). Phase 22 depends on all prior phases.

**Technical prerequisite ordering:**
1. Frontend type extension (`lib/types.ts`) -- needed by both Phase 20 (for `toGA4Item` enrichment) and Phase 21 (for UI rendering)
2. Backend query adjustment (`adSlots.ts` publisher select) -- needed by Phase 21 for card enrichment
3. `EXPERIMENTS` registry entry -- needed by Phase 21 for live A/B test
