import { Router, type Response, type IRouter } from 'express';
import { requireAuth, type AuthRequest } from '../auth.js';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { apiError } from '../utils/errors.js';
import { logger } from '../logger.js';

const router: IRouter = Router();

// All publisher routes require authentication
router.use(requireAuth);

// GET /api/publishers - Get authenticated user's publisher profile
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json(apiError(401, 'UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    if (!user.publisherId) {
      res.status(403).json(apiError(403, 'FORBIDDEN', 'Publisher access required'));
      return;
    }

    const publisher = await prisma.publisher.findUnique({
      where: { id: user.publisherId },
      include: {
        _count: {
          select: { adSlots: true, placements: true },
        },
      },
    });

    if (!publisher) {
      res.status(404).json(apiError(404, 'NOT_FOUND', 'Publisher not found'));
      return;
    }

    res.json(publisher);
  } catch (error) {
    logger.error('Error fetching publisher:', error);
    res.status(500).json(apiError(500, 'INTERNAL_ERROR', 'Failed to fetch publisher'));
  }
});

// GET /api/publishers/:id - Get publisher by ID (ownership enforced)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json(apiError(401, 'UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    const id = getParam(req.params.id);

    // Publishers can only view their own profile
    if (user.publisherId !== id) {
      res.status(403).json(apiError(403, 'FORBIDDEN', "You don't own this publisher profile"));
      return;
    }

    const publisher = await prisma.publisher.findUnique({
      where: { id },
      include: {
        adSlots: true,
        placements: {
          include: {
            campaign: { select: { name: true, sponsor: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!publisher) {
      res.status(404).json(apiError(404, 'NOT_FOUND', 'Publisher not found'));
      return;
    }

    res.json(publisher);
  } catch (error) {
    logger.error('Error fetching publisher:', error);
    res.status(500).json(apiError(500, 'INTERNAL_ERROR', 'Failed to fetch publisher'));
  }
});

export default router;
