import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks -- hoisted above all imports by vitest
// ---------------------------------------------------------------------------

// Mock pg to prevent real Pool creation (auth.ts -> betterAuth -> Pool)
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
    adSlot: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn(), aggregate: vi.fn() },
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

// Mock auth.js -- default: PUBLISHER user (ad slots are primarily a publisher resource)
vi.mock('../../auth.js', () => ({
  requireAuth: vi.fn(
    (req: Record<string, unknown>, _res: unknown, next: () => void) => {
      req.user = {
        id: 'user-1',
        email: 'publisher@test.com',
        role: 'PUBLISHER',
        publisherId: 'publisher-1',
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

/** A structurally complete ad-slot object for mock returns */
function makeAdSlot(overrides: Record<string, unknown> = {}) {
  return {
    id: 'slot-1',
    name: 'Test Ad Slot',
    description: 'A test ad slot',
    type: 'DISPLAY',
    position: 'sidebar',
    width: 300,
    height: 250,
    basePrice: 100,
    cpmFloor: null,
    isAvailable: true,
    bookedBySponsorId: null,
    publisherId: 'publisher-1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publisher: { id: 'publisher-1', name: 'Test Publisher' },
    _count: { placements: 0 },
    ...overrides,
  };
}

/** Valid body for POST /api/ad-slots */
function validAdSlotBody() {
  return {
    name: 'New Ad Slot',
    type: 'DISPLAY',
    basePrice: 100,
  };
}

/** Switch requireAuth to a SPONSOR user for the next request */
function mockAsSponsor() {
  vi.mocked(requireAuth).mockImplementationOnce(
    (req: Record<string, unknown>, _res: unknown, next: () => void) => {
      req.user = {
        id: 'user-2',
        email: 'sponsor@test.com',
        role: 'SPONSOR',
        sponsorId: 'sponsor-1',
      };
      next();
    },
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Ad-slot endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Restore default requireAuth behavior (publisher user)
    vi.mocked(requireAuth).mockImplementation(
      (req: Record<string, unknown>, _res: unknown, next: () => void) => {
        req.user = {
          id: 'user-1',
          email: 'publisher@test.com',
          role: 'PUBLISHER',
          publisherId: 'publisher-1',
        };
        next();
      },
    );
  });

  // =========================================================================
  // GET /api/ad-slots
  // =========================================================================

  describe('GET /api/ad-slots', () => {
    it('returns ad slots for authenticated publisher (scoped to own)', async () => {
      const adSlots = [makeAdSlot()];
      vi.mocked(prisma.adSlot.findMany).mockResolvedValue(adSlots as never);

      const res = await request(app).get('/api/ad-slots');

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Test Ad Slot');
      // Verify publisher scoping: findMany was called with publisherId filter
      expect(prisma.adSlot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ publisherId: 'publisher-1' }),
        }),
      );
    });

    it('returns all ad slots for sponsor (marketplace browsing)', async () => {
      mockAsSponsor();
      const adSlots = [makeAdSlot(), makeAdSlot({ id: 'slot-2', publisherId: 'publisher-other' })];
      vi.mocked(prisma.adSlot.findMany).mockResolvedValue(adSlots as never);

      const res = await request(app).get('/api/ad-slots');

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(2);
      // Verify sponsor sees all: findMany was called WITHOUT publisherId filter
      expect(prisma.adSlot.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ publisherId: expect.anything() }),
        }),
      );
    });
  });

  // =========================================================================
  // GET /api/ad-slots/:id
  // =========================================================================

  describe('GET /api/ad-slots/:id', () => {
    it('returns ad slot when publisher owns it', async () => {
      const adSlot = makeAdSlot({
        publisher: { id: 'publisher-1', name: 'Test Publisher' },
        placements: [],
      });
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(adSlot as never);

      const res = await request(app).get('/api/ad-slots/slot-1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('slot-1');
      expect(res.body.name).toBe('Test Ad Slot');
    });

    it('returns 403 when publisher does not own the ad slot', async () => {
      const adSlot = makeAdSlot({
        publisherId: 'publisher-other',
        publisher: { id: 'publisher-other', name: 'Other Publisher' },
        placements: [],
      });
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(adSlot as never);

      const res = await request(app).get('/api/ad-slots/slot-1');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 200 when sponsor views any ad slot (marketplace access)', async () => {
      mockAsSponsor();
      const adSlot = makeAdSlot({
        publisherId: 'publisher-other',
        publisher: { id: 'publisher-other', name: 'Other Publisher' },
        placements: [],
      });
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(adSlot as never);

      const res = await request(app).get('/api/ad-slots/slot-1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('slot-1');
    });

    it('returns 404 when ad slot does not exist', async () => {
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(null as never);

      const res = await request(app).get('/api/ad-slots/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =========================================================================
  // POST /api/ad-slots
  // =========================================================================

  describe('POST /api/ad-slots', () => {
    it('creates ad slot with valid data for publisher', async () => {
      const created = makeAdSlot({
        id: 'slot-new',
        name: 'New Ad Slot',
        basePrice: 100,
      });
      vi.mocked(prisma.adSlot.create).mockResolvedValue(created as never);

      const res = await request(app)
        .post('/api/ad-slots')
        .send(validAdSlotBody());

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('slot-new');
      expect(res.body.name).toBe('New Ad Slot');
    });

    it('returns 403 when sponsor tries to create ad slot', async () => {
      mockAsSponsor();

      const res = await request(app)
        .post('/api/ad-slots')
        .send(validAdSlotBody());

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 400 for invalid data (missing name)', async () => {
      const res = await request(app)
        .post('/api/ad-slots')
        .send({ type: 'DISPLAY', basePrice: 100 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =========================================================================
  // PUT /api/ad-slots/:id
  // =========================================================================

  describe('PUT /api/ad-slots/:id', () => {
    it('updates ad slot when publisher owns it', async () => {
      const existing = makeAdSlot();
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(existing as never);

      const updated = makeAdSlot({ name: 'Updated Slot' });
      vi.mocked(prisma.adSlot.update).mockResolvedValue(updated as never);

      const res = await request(app)
        .put('/api/ad-slots/slot-1')
        .send({ name: 'Updated Slot' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Slot');
    });

    it('returns 403 when publisher does not own the ad slot', async () => {
      const adSlot = makeAdSlot({ publisherId: 'publisher-other' });
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(adSlot as never);

      const res = await request(app)
        .put('/api/ad-slots/slot-1')
        .send({ name: 'Hijack Attempt' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 404 when ad slot does not exist', async () => {
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(null as never);

      const res = await request(app)
        .put('/api/ad-slots/nonexistent')
        .send({ name: 'Ghost Slot' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =========================================================================
  // DELETE /api/ad-slots/:id
  // =========================================================================

  describe('DELETE /api/ad-slots/:id', () => {
    it('deletes ad slot and returns 204 when owner', async () => {
      const adSlot = makeAdSlot();
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(adSlot as never);
      vi.mocked(prisma.adSlot.delete).mockResolvedValue(adSlot as never);

      const res = await request(app).delete('/api/ad-slots/slot-1');

      expect(res.status).toBe(204);
      expect(prisma.adSlot.delete).toHaveBeenCalledWith({ where: { id: 'slot-1' } });
    });

    it('returns 403 when publisher does not own the ad slot', async () => {
      const adSlot = makeAdSlot({ publisherId: 'publisher-other' });
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(adSlot as never);

      const res = await request(app).delete('/api/ad-slots/slot-1');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns 404 when ad slot does not exist', async () => {
      vi.mocked(prisma.adSlot.findUnique).mockResolvedValue(null as never);

      const res = await request(app).delete('/api/ad-slots/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
