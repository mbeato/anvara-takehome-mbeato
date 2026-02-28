import { Router, type Response, type IRouter } from 'express';
import { requireAuth, type AuthRequest } from '../auth.js';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { apiError } from '../utils/errors.js';
import { validate, createPlacementSchema } from '../utils/validation.js';
import { logger } from '../logger.js';

const router: IRouter = Router();

// All placement routes require authentication
router.use(requireAuth);

// GET /api/placements - List placements scoped by user role
// Sponsors see placements for their campaigns
// Publishers see placements for their publisher ID
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json(apiError(401, 'UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    const { status } = req.query;

    // Build role-scoped WHERE clause
    const where = {
      ...(user.role === 'SPONSOR' && user.sponsorId && {
        campaign: { sponsorId: user.sponsorId },
      }),
      ...(user.role === 'PUBLISHER' && user.publisherId && {
        publisherId: user.publisherId,
      }),
      ...(status && {
        status: status as string as
          | 'PENDING'
          | 'APPROVED'
          | 'REJECTED'
          | 'ACTIVE'
          | 'PAUSED'
          | 'COMPLETED',
      }),
    };

    const placements = await prisma.placement.findMany({
      where,
      include: {
        campaign: { select: { id: true, name: true } },
        creative: { select: { id: true, name: true, type: true } },
        adSlot: { select: { id: true, name: true, type: true } },
        publisher: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(placements);
  } catch (error) {
    logger.error('Error fetching placements:', error);
    res.status(500).json(apiError(500, 'INTERNAL_ERROR', 'Failed to fetch placements'));
  }
});

// POST /api/placements - Create new placement (sponsors only, must own the campaign)
router.post('/', validate(createPlacementSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json(apiError(401, 'UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    if (!user.sponsorId) {
      res.status(403).json(apiError(403, 'FORBIDDEN', 'Only sponsors can create placements'));
      return;
    }

    const {
      campaignId,
      creativeId,
      adSlotId,
      publisherId,
      agreedPrice,
      pricingModel,
      startDate,
      endDate,
    } = req.body;

    // Verify the campaign belongs to the authenticated sponsor
    const campaign = await prisma.campaign.findUnique({
      where: { id: getParam(campaignId) },
      select: { sponsorId: true },
    });

    if (!campaign) {
      res.status(404).json(apiError(404, 'NOT_FOUND', 'Campaign not found'));
      return;
    }

    if (campaign.sponsorId !== user.sponsorId) {
      res.status(403).json(apiError(403, 'FORBIDDEN', "You don't own this campaign"));
      return;
    }

    const placement = await prisma.placement.create({
      data: {
        campaignId,
        creativeId,
        adSlotId,
        publisherId,
        agreedPrice,
        pricingModel: pricingModel || 'CPM',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        campaign: { select: { name: true } },
        publisher: { select: { name: true } },
      },
    });

    res.status(201).json(placement);
  } catch (error) {
    logger.error('Error creating placement:', error);
    res.status(500).json(apiError(500, 'INTERNAL_ERROR', 'Failed to create placement'));
  }
});

export default router;
