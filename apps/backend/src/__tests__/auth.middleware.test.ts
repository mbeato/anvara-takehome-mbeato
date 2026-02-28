import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type Request, type Response, type NextFunction } from 'express';

// ---------------------------------------------------------------------------
// Mocks — hoisted above all imports by vitest
// ---------------------------------------------------------------------------

// vi.hoisted runs before vi.mock hoisting, so mockGetSession is available
const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

// Mock pg to prevent real Pool creation
vi.mock('pg', () => ({
  Pool: vi.fn(),
}));

// Mock better-auth to prevent real auth initialization
vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: { getSession: mockGetSession },
  })),
}));

// Mock better-auth/node to prevent fromNodeHeaders issues
vi.mock('better-auth/node', () => ({
  fromNodeHeaders: vi.fn((h: unknown) => h),
}));

// Mock ../db.js to prevent Prisma initialization
vi.mock('../db.js', () => ({
  prisma: {
    sponsor: { findUnique: vi.fn() },
    publisher: { findUnique: vi.fn() },
  },
}));

// Mock ../logger.js for silent output
vi.mock('../logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Imports — resolved against mocked modules
// ---------------------------------------------------------------------------

import { requireAuth } from '../auth.js';
import { prisma } from '../db.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('requireAuth middleware', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = createMockReq({ cookie: 'session=abc' });
    mockRes = createMockRes();
    mockNext = vi.fn();
  });

  it('returns 401 when no session exists', async () => {
    mockGetSession.mockResolvedValue(null);

    await requireAuth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        status: 401,
        message: 'Valid session required',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 401 when session has no user', async () => {
    mockGetSession.mockResolvedValue({ session: {}, user: null });

    await requireAuth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        status: 401,
        message: 'Valid session required',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('resolves SPONSOR role and attaches sponsorId', async () => {
    mockGetSession.mockResolvedValue({
      session: { id: 'sess-1' },
      user: { id: 'user-1', email: 'sponsor@test.com' },
    });
    vi.mocked(prisma.sponsor.findUnique).mockResolvedValue({ id: 'sp-1' } as never);
    vi.mocked(prisma.publisher.findUnique).mockResolvedValue(null as never);

    await requireAuth(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect((mockReq as unknown as Record<string, unknown>).user).toEqual({
      id: 'user-1',
      email: 'sponsor@test.com',
      role: 'SPONSOR',
      sponsorId: 'sp-1',
    });
  });

  it('resolves PUBLISHER role and attaches publisherId', async () => {
    mockGetSession.mockResolvedValue({
      session: { id: 'sess-2' },
      user: { id: 'user-2', email: 'publisher@test.com' },
    });
    vi.mocked(prisma.sponsor.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.publisher.findUnique).mockResolvedValue({ id: 'pub-1' } as never);

    await requireAuth(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect((mockReq as unknown as Record<string, unknown>).user).toEqual({
      id: 'user-2',
      email: 'publisher@test.com',
      role: 'PUBLISHER',
      publisherId: 'pub-1',
    });
  });

  it('returns 403 when user has no role (no sponsor or publisher record)', async () => {
    mockGetSession.mockResolvedValue({
      session: { id: 'sess-3' },
      user: { id: 'user-3', email: 'norole@test.com' },
    });
    vi.mocked(prisma.sponsor.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.publisher.findUnique).mockResolvedValue(null as never);

    await requireAuth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        code: 'NO_ROLE',
        status: 403,
        message: 'User has no assigned role',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 401 when getSession throws an error', async () => {
    mockGetSession.mockRejectedValue(new Error('Connection refused'));

    await requireAuth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        status: 401,
        message: 'Session validation failed',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
