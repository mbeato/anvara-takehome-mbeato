import { Router, type Response, type IRouter } from 'express';
import { requireAuth, type AuthRequest } from '../auth.js';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';

const router: IRouter = Router();

// All campaign routes require authentication
router.use(requireAuth);

// GET /api/campaigns - List authenticated sponsor's campaigns
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const campaigns = await prisma.campaign.findMany({
      where: {
        sponsorId: req.user!.sponsorId,
        ...(status && { status: status as string as 'ACTIVE' | 'PAUSED' | 'COMPLETED' }),
      },
      include: {
        sponsor: { select: { id: true, name: true, logo: true } },
        _count: { select: { creatives: true, placements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to fetch campaigns' },
    });
  }
});

// GET /api/campaigns/:id - Get single campaign with details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        sponsor: true,
        creatives: true,
        placements: {
          include: {
            adSlot: true,
            publisher: { select: { id: true, name: true, category: true } },
          },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', status: 404, message: 'Campaign not found' },
      });
      return;
    }

    if (campaign.sponsorId !== req.user!.sponsorId) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', status: 403, message: "You don't own this campaign" },
      });
      return;
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to fetch campaign' },
    });
  }
});

// POST /api/campaigns - Create new campaign
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      budget,
      cpmRate,
      cpcRate,
      startDate,
      endDate,
      targetCategories,
      targetRegions,
    } = req.body;

    if (!name || !budget || !startDate || !endDate) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          status: 400,
          message: 'Name, budget, startDate, and endDate are required',
        },
      });
      return;
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        budget,
        cpmRate,
        cpcRate,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetCategories: targetCategories || [],
        targetRegions: targetRegions || [],
        sponsorId: req.user!.sponsorId!,
      },
      include: {
        sponsor: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to create campaign' },
    });
  }
});

// TODO: Add PUT /api/campaigns/:id endpoint
// Update campaign details (name, budget, dates, status, etc.)

export default router;
