<div align="left" style="margin-bottom: 2rem;">
  <img src="https://anvara-production.nyc3.cdn.digitaloceanspaces.com/anvarabluetext.png" alt="Anvara" width="500" />
</div>

# Anvara Take-Home Test

```
## ⚠️ Important: Do NOT Fork This Repository

This is a take-home assessment. Please:

1. **Clone** (not fork) this repository
2. Work on it locally
3. Create your own **new public repository**
4. Push your work there
5. Send us the link to YOUR repository

Do not open pull requests to the original repo.
```

## Table of Contents

- [Anvara Take-Home Test](#anvara-take-home-test)
  - [Table of Contents](#table-of-contents)
  - [tl;dr](#tldr)
  - [About This Assessment](#about-this-assessment)
  - [Current State](#current-state)
  - [Tech Stack](#tech-stack)
  - [Assumptions](#assumptions)
  - [Project Structure](#project-structure)
  - [Quick Start](#quick-start)
    - [Clone Repository](#clone-repository)
    - [Automated Setup (Recommended)](#automated-setup-recommended)
    - [Manual Setup](#manual-setup)
  - [Development](#development)
  - [Database](#database)
  - [Authentication](#authentication)
  - [Documentation](#documentation)
    - [Individual Challenges](#individual-challenges)
    - [Bonus Challenges](#bonus-challenges)
  - [v1.3: Hard Bonuses](#v13-hard-bonuses)
  - [Resources](#resources)
  - [Need Help?](#need-help)

## tl;dr

- **�  New here? [Setup the Project](#quick-start)**
- **🎯 Ready to code? [Start the Challenges](#individual-challenges)**
- **❓ Need help? [Check the Docs](docs/README.md)**
- **📤 Done? [Submit Your Work](docs/submission.md)**

## About This Assessment

This take-home test is designed to evaluate your skills across multiple areas of full-stack development. **Complete as many challenges as you can** - you don't need to finish everything!

**Take your time.** Work at your own pace, and submit when you feel you've shown us your best work. Where you stop tells us about your current skill level, and that's perfectly okay. We'd rather see quality work on fewer challenges than rushed attempts at all of them.
A sponsorship marketplace connecting sponsors with publishers, built with modern best practices.

## Current State

All 5 core challenges and all bonus challenges through v1.3 (Hard Bonuses) are complete:

- **v1.0 Core Challenges**: TypeScript fixes, server-side data fetching, API security, CRUD operations, server actions
- **v1.1 Easy Bonuses**: Newsletter signup, pagination, quote request feature
- **v1.2 Medium Bonuses**: Landing page, dashboard redesign, campaign builder, mobile responsive, dark mode, component library
- **v1.3 Hard Bonuses**: Google Analytics, conversion tracking, A/B testing framework, marketplace conversion optimization

For a guided walkthrough of all v1.3 features, see [VERIFICATION.md](VERIFICATION.md).

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: Express.js, Prisma ORM, PostgreSQL
- **Auth**: Better Auth
- **Monorepo**: PNPM workspaces
- **Testing**: Vitest
- **Linting**: ESLint 9

## Assumptions

- Node.js v20+
- PNPM v8+
- Docker installed and running

If not confident, see the [Setup Guide](docs/setup.md)

## Project Structure

```
apps/
├── frontend/                 # Next.js app (port 3847)
│   ├── app/
│   │   ├── components/       # Shared components
│   │   ├── api/auth/         # Better Auth routes
│   │   ├── dashboard/        # Role-based dashboards
│   │   │   ├── sponsor/
│   │   │   └── publisher/
│   │   └── marketplace/      # Public marketplace
│   └── lib/
│       ├── api.ts            # API client
│       ├── types.ts          # Type definitions
│       └── utils.ts          # Utilities
│
├── backend/                  # Express API (port 4291)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── index.ts          # API routes
│       ├── db.ts             # Prisma client
│       └── utils/
│           └── helpers.ts
│
└── packages/
    ├── config/               # Shared TypeScript config
    ├── eslint-config/        # Shared ESLint rules
    └── prettier-config/      # Shared Prettier config

scripts/
├── setup.ts                  # Automated setup script
└── tsconfig.json             # Scripts TypeScript config
```

## Quick Start

### Clone Repository

```bash
git clone https://github.com/anvara-project/take-home.git
cd take-home
```

### Automated Setup (Recommended)

```bash
pnpm setup-project
```

This runs the **complete setup** including dependency installation, Docker initialization, database setup, and seeding.

---

### Manual Setup

See the [Setup Guide](docs/setup.md) for detailed manual setup instructions.

## Development

```bash
# Start all services
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code with Prettier
pnpm format

# Open Prisma Studio
pnpm --filter @anvara/backend db:studio
```

## Database

PostgreSQL runs in Docker on port 5498:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View Prisma Studio
pnpm --filter @anvara/backend db:studio
```

## Authentication

Better Auth is configured for role-based access:

- **Sponsors**: View campaigns, create placements
- **Publishers**: View ad slots, manage availability

**Demo accounts:**

- `sponsor@example.com` / `password`
- `publisher@example.com` / `password`

See the [setup guide](docs/setup.md) for configuration details.

## Documentation

| Document                                         | Description                     |
| ------------------------------------------------ | ------------------------------- |
| [Setup Guide](docs/setup.md)                     | Installation and configuration  |
| [Challenges Overview](docs/challenges/README.md) | All challenges and requirements |
| [Submission Guide](docs/submission.md)           | How to submit your work         |

### Individual Challenges

- [Challenge 1: Fix TypeScript Errors](docs/challenges/01-typescript.md)
- [Challenge 2: Server-Side Data Fetching](docs/challenges/02-server-components.md)
- [Challenge 3: Secure API Endpoints](docs/challenges/03-api-security.md)
- [Challenge 4: Complete CRUD Operations](docs/challenges/04-crud-operations.md)
- [Challenge 5: Dashboards with Server Actions](docs/challenges/05-server-actions.md)

### Bonus Challenges

Explore [all bonus challenges](docs/bonus-challenges/README.md) organized by category:

**🛒 Product & Business**

- [Improve Marketplace Conversions](docs/bonus-challenges/business/01-marketplace-conversions.md)
- [Newsletter Signup Form](docs/bonus-challenges/business/02-newsletter-signup.md)
- [Request a Quote Feature](docs/bonus-challenges/business/03-request-quote.md)

**🎨 Design & UX**

- [Marketing Landing Page](docs/bonus-challenges/design/01-landing-page.md)
- [Dashboard Redesign](docs/bonus-challenges/design/02-dashboard.md)
- [Campaign Builder Flow](docs/bonus-challenges/design/03-campaign-builder.md)
- [Mobile-First Experience](docs/bonus-challenges/design/04-mobile-responsive.md)
- [Dark Mode Support](docs/bonus-challenges/design/05-dark-mode.md)
- [Component Library](docs/bonus-challenges/design/06-component-library.md)
- [Data Table Pagination](docs/bonus-challenges/design/07-pagination.md)

**📊 Analytics & Testing**

- [Google Analytics Setup](docs/bonus-challenges/analytics/01-google-analytics.md)
- [Conversion Tracking](docs/bonus-challenges/analytics/02-conversion-tracking.md)
- [A/B Testing Framework](docs/bonus-challenges/analytics/03-ab-testing.md)

## v1.3: Hard Bonuses

The v1.3 milestone covers analytics, conversion optimization, and A/B testing -- the "hard bonus" challenges.

### A/B Testing Framework

Cookie-based variant assignment with server-side randomization at the edge:

- **Edge middleware** (`proxy.ts`): Sets `ab_[experiment-name]` cookies on first visit via Next.js middleware. Variants are assigned server-side before page render using weighted random selection.
- **Client hook** (`useABTest`): Reads the cookie client-side, fires a one-time `ab_test_exposure` event (ref-guarded against duplicates), and returns the active variant.
- **Experiment registry** (`ab-tests.ts`): Single source of truth for all experiments. Both the edge middleware and client hook read from the same `EXPERIMENTS` array, preventing config drift.
- **Debug URL overrides**: Append `?ab_cta-copy=B` to any URL to force a variant. Stored in sessionStorage for the session duration.
- **Live experiment**: `cta-copy` A/B test on the detail page CTA -- "Book This Placement" (A) vs. "Reach N Monthly Readers" (B), 50/50 split.

### Conversion Tracking

Full-funnel GA4 event instrumentation from browse through convert:

- **5 funnel events**: `marketplace_view` (browse), `view_item` (view), `begin_checkout` (engage), `purchase` and `generate_lead` (convert)
- **Micro-conversions**: `filter_used`, `pagination_used` for engagement tracking
- **Automatic enrichment**: Every event includes `user_type` (authenticated/anonymous) and all active A/B variant values via the `track()` function
- **GA4 ecommerce**: Standard ecommerce parameters (`items`, `value`, `currency`, `transaction_id`) on checkout and conversion events via `toGA4Item()`
- **Dev console output**: In development mode, events log to the browser console with structured formatting instead of sending to GA4

### Marketplace Conversion Optimization

Analysis-driven UX improvements documented in [CONVERSION_ANALYSIS.md](CONVERSION_ANALYSIS.md):

- **Publisher trust signals**: Audience metrics (monthly views, subscriber count), category badges, and verified publisher indicators on detail pages
- **Enriched marketplace cards**: Audience reach, publisher category, and "Popular" badges for listings with booking history
- **Availability filtering**: "Available Only" toggle using existing backend `?available=true` support
- **B2B-appropriate scarcity**: "In Demand" indicators based on real placement data (no artificial urgency)
- **Value-oriented CTA**: A/B tested -- dynamic copy showing publisher audience reach vs. generic "Book This Placement"
- **Related listings**: "More from this publisher" section on detail pages to reduce bounce-to-exit

### Key Documents

| Document | Description |
|----------|-------------|
| [VERIFICATION.md](VERIFICATION.md) | Step-by-step verification guide for all v1.3 features |
| [CONVERSION_ANALYSIS.md](CONVERSION_ANALYSIS.md) | Marketplace conversion analysis with 8 friction points and measurement plans |

### E2E Tests

```bash
pnpm e2e
```

Runs the Playwright test suite covering A/B cookie assignment, funnel event sequencing, and mobile responsiveness at 375px.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)

## Need Help?

- **Setup issues?** Check the [Setup Guide](docs/setup.md)
- **Challenge questions?** Review the [individual challenge pages](docs/challenges/README.md)
- **Submission questions?** See the [Submission Guide](docs/submission.md)
