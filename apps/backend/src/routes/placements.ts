import { Router, type Response, type IRouter } from 'express';
import { requireAuth, type AuthRequest } from '../auth.js';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';

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
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
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
    console.error('Error fetching placements:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to fetch placements' },
    });
  }
});

// POST /api/placements - Create new placement (sponsors only, must own the campaign)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    if (!user.sponsorId) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', status: 403, message: 'Only sponsors can create placements' },
      });
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

    if (!campaignId || !creativeId || !adSlotId || !publisherId || !agreedPrice) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          status: 400,
          message: 'campaignId, creativeId, adSlotId, publisherId, and agreedPrice are required',
        },
      });
      return;
    }

    // Verify the campaign belongs to the authenticated sponsor
    const campaign = await prisma.campaign.findUnique({
      where: { id: getParam(campaignId) },
      select: { sponsorId: true },
    });

    if (!campaign) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', status: 404, message: 'Campaign not found' },
      });
      return;
    }

    if (campaign.sponsorId !== user.sponsorId) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', status: 403, message: "You don't own this campaign" },
      });
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
    console.error('Error creating placement:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to create placement' },
    });
  }
});

export default router;
