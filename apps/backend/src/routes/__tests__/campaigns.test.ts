import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks -- hoisted above all imports by vitest
// ---------------------------------------------------------------------------

// Mock pg to prevent real Pool creation (auth.ts → betterAuth → Pool)
vi.mock('pg', () => ({
  Pool: vi.fn(),
}));

// Mock better-auth to prevent real auth initialization
vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: { getSession: vi.fn() },
  })),
}));

// Mock better-auth/node
vi.mock('better-auth/node', () => ({
  fromNodeHeaders: vi.fn((h: unknown) => h),
}));

// Mock db.js with all Prisma models needed across all routes
vi.mock('../../db.js', () => ({
  prisma: {
    campaign: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    sponsor: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    publisher: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    adSlot: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    placement: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    creative: { findMany: vi.fn(), findUnique: vi.fn() },
    payment: { findMany: vi.fn() },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
  CampaignStatus: {
    DRAFT: 'DRAFT',
    PENDING_REVIEW: 'PENDING_REVIEW',
    APPROVED: 'APPROVED',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  AdSlotType: {
    DISPLAY: 'DISPLAY',
    VIDEO: 'VIDEO',
    NATIVE: 'NATIVE',
    NEWSLETTER: 'NEWSLETTER',
    PODCAST: 'PODCAST',
  },
  PlacementStatus: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  SubscriptionTier: { FREE: 'FREE', PRO: 'PRO', ENTERPRISE: 'ENTERPRISE' },
  PricingModel: { CPM: 'CPM', CPC: 'CPC', CPA: 'CPA', FLAT_RATE: 'FLAT_RATE' },
}));

// Mock auth.js -- default: sponsor user authenticated
vi.mock('../../auth.js', () => ({
  requireAuth: vi.fn(
    (req: Record<string, unknown>, _res: unknown, next: () => void) => {
      req.user = {
        id: 'user-1',
        email: 'sponsor@test.com',
        role: 'SPONSOR',
        sponsorId: 'sponsor-1',
      };
      next();
    },
  ),
  auth: { api: { getSession: vi.fn() } },
}));

// Mock logger for silent output
vi.mock('../../logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

// ---------------------------------------------------------------------------
// Imports -- resolved against mocked modules
// ---------------------------------------------------------------------------

import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../db.js';
import { requireAuth } from '../../auth.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A structurally complete campaign object for mock returns */
function makeCampaign(overrides: Record<string, unknown> = {}) {
  return {
    id: 'camp-1',
    name: 'Test Campaign',
    description: 'A test campaign',
    budget: 5000,
    cpmRate: 2.5,
    cpcRate: null,
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-05-01'),
    status: 'DRAFT',
    targetCategories: ['tech'],
    targetRegions: ['US'],
    sponsorId: 'sponsor-1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    sponsor: { id: 'sponsor-1', name: 'Test Sponsor', logo: null },
    _count: { creatives: 0, placements: 0 },
    ...overrides,
  };
}

/** Valid body for POST /api/campaigns */
function validCampaignBody() {
  return {
    name: 'New Campaign',
    budget: 10000,
    startDate: '2026-06-01',
    endDate: '2026-07-01',
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Campaign endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Restore default requireAuth behavior (sponsor user)
    vi.mocked(requireAuth).mockImplementation(
      (req: Record<string, unknown>, _res: unknown, next: () => void) => {
        req.user = {
          id: 'user-1',
          email: 'sponsor@test.com',
          role: 'SPONSOR',
          sponsorId: 'sponsor-1',
        };
        next();
      },
    );
  });

  // =========================================================================
  // GET /api/campaigns
  // =========================================================================

  describe('GET /api/campaigns', () => {
    it('returns campaigns for authenticated sponsor', async () => {
      const campaigns = [makeCampaign()];
      vi.mocked(prisma.campaign.findMany).mockResolvedValue(campaigns as never);

      const res = await request(app).get('/api/campaigns');

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Test Campaign');
    });

    it('returns 401 when not authenticated', async () => {
      vi.mocked(requireAuth).mockImplementationOnce(
        (_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }, _next: () => void) => {
          res.status(401).json({
            error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' },
          });
        },
      );

      const res = await request(app).get('/api/campaigns');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  // =========================================================================
  // GET /api/campaigns/:id
  // =========================================================================

  describe('GET /api/campaigns/:id', () => {
    it('returns campaign when sponsor owns it', async () => {
      const campaign = makeCampaign({
        sponsor: { id: 'sponsor-1', name: 'Test Sponsor' },
        creatives: [],
        placements: [],
      });
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue(campaign as never);

      const res = await request(app).get('/api/campaigns/camp-1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('camp-1');
      expect(res.body.name).toBe('Test Campaign');
    });

    it('returns 404 when campaign does not exist', async () => {
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue(null as never);

      const res = await request(app).get('/api/campaigns/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 403 when sponsor does not own the campaign', async () => {
      const campaign = makeCampaign({
        sponsorId: 'sponsor-other',
        sponsor: { id: 'sponsor-other', name: 'Other Sponsor' },
        creatives: [],
        placements: [],
      });
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue(campaign as never);

      const res = await request(app).get('/api/campaigns/camp-1');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // =========================================================================
  // POST /api/campaigns
  // =========================================================================

  describe('POST /api/campaigns', () => {
    it('creates campaign with valid data', async () => {
      const created = makeCampaign({
        id: 'camp-new',
        name: 'New Campaign',
        budget: 10000,
        sponsor: { id: 'sponsor-1', name: 'Test Sponsor' },
      });
      vi.mocked(prisma.campaign.create).mockResolvedValue(created as never);

      const res = await request(app)
        .post('/api/campaigns')
        .send(validCampaignBody());

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('camp-new');
      expect(res.body.name).toBe('New Campaign');
    });

    it('returns 400 for invalid data (missing name)', async () => {
      const res = await request(app)
        .post('/api/campaigns')
        .send({
          budget: 10000,
          startDate: '2026-06-01',
          endDate: '2026-07-01',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 403 when publisher tries to create campaign', async () => {
      vi.mocked(requireAuth).mockImplementationOnce(
        (req: Record<string, unknown>, _res: unknown, next: () => void) => {
          req.user = {
            id: 'user-2',
            email: 'publisher@test.com',
            role: 'PUBLISHER',
            publisherId: 'pub-1',
            // no sponsorId
          };
          next();
        },
      );

      const res = await request(app)
        .post('/api/campaigns')
        .send(validCampaignBody());

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  // =========================================================================
  // PUT /api/campaigns/:id
  // =========================================================================

  describe('PUT /api/campaigns/:id', () => {
    it('updates campaign when sponsor owns it', async () => {
      const existing = makeCampaign();
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue(existing as never);

      const updated = makeCampaign({ name: 'Updated Name' });
      vi.mocked(prisma.campaign.update).mockResolvedValue(updated as never);

      const res = await request(app)
        .put('/api/campaigns/camp-1')
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('returns 403 when sponsor does not own the campaign', async () => {
      const campaign = makeCampaign({ sponsorId: 'sponsor-other' });
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue(campaign as never);

      const res = await request(app)
        .put('/api/campaigns/camp-1')
        .send({ name: 'Hijack Attempt' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 404 when campaign does not exist', async () => {
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue(null as never);

      const res = await request(app)
        .put('/api/campaigns/nonexistent')
        .send({ name: 'Ghost Campaign' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =========================================================================
  // DELETE /api/campaigns/:id
  // =========================================================================

  describe('DELETE /api/campaigns/:id', () => {
    it('deletes campaign and returns 204 when owner', async () => {
      const campaign = makeCampaign();
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue(campaign as never);
      vi.mocked(prisma.campaign.delete).mockResolvedValue(campaign as never);

      const res = await request(app).delete('/api/campaigns/camp-1');

      expect(res.status).toBe(204);
      expect(prisma.campaign.delete).toHaveBeenCalledWith({ where: { id: 'camp-1' } });
    });

    it('returns 403 when sponsor does not own the campaign', async () => {
      const campaign = makeCampaign({ sponsorId: 'sponsor-other' });
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue(campaign as never);

      const res = await request(app).delete('/api/campaigns/camp-1');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 404 when campaign does not exist', async () => {
      vi.mocked(prisma.campaign.findUnique).mockResolvedValue(null as never);

      const res = await request(app).delete('/api/campaigns/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
