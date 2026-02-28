import { Router, type Request, type Response, type IRouter } from 'express';
import { requireAuth, type AuthRequest } from '../auth.js';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { apiError } from '../utils/errors.js';
import { logger } from '../logger.js';

const router: IRouter = Router();

// NOTE: Authentication is handled by Better Auth on the frontend
// This route is kept for any backend-specific auth utilities

// POST /api/auth/login - Placeholder (Better Auth handles login via frontend)
router.post('/login', async (_req: Request, res: Response) => {
  res.status(400).json(apiError(400, 'BAD_REQUEST', 'Use the frontend login at /login instead. Better Auth handles authentication via the Next.js frontend'));
});

// GET /api/auth/me - Get current user profile
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json(apiError(401, 'UNAUTHORIZED', 'Not authenticated'));
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    sponsorId: user.sponsorId ?? null,
    publisherId: user.publisherId ?? null,
  });
});

// GET /api/auth/role/:userId - Get user role based on Sponsor/Publisher records
router.get('/role/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json(apiError(401, 'UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    const userId = getParam(req.params.userId);

    // Only allow looking up your own role
    if (userId !== user.id) {
      res.status(403).json(apiError(403, 'FORBIDDEN', 'Can only look up your own role'));
      return;
    }

    // Check if user is a sponsor
    const sponsor = await prisma.sponsor.findUnique({
      where: { userId },
      select: { id: true, name: true },
    });

    if (sponsor) {
      res.json({ role: 'sponsor', sponsorId: sponsor.id, name: sponsor.name });
      return;
    }

    // Check if user is a publisher
    const publisher = await prisma.publisher.findUnique({
      where: { userId },
      select: { id: true, name: true },
    });

    if (publisher) {
      res.json({ role: 'publisher', publisherId: publisher.id, name: publisher.name });
      return;
    }

    // User has no role assigned
    res.json({ role: null });
  } catch (error) {
    logger.error('Error fetching user role:', error);
    res.status(500).json(apiError(500, 'INTERNAL_ERROR', 'Failed to fetch user role'));
  }
});

export default router;
