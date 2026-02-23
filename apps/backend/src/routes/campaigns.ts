import { Router, type Response, type IRouter } from 'express';
import { requireAuth, type AuthRequest } from '../auth.js';
import { prisma, CampaignStatus } from '../db.js';
import { getParam, parsePagination } from '../utils/helpers.js';

const router: IRouter = Router();

// All campaign routes require authentication
router.use(requireAuth);

// GET /api/campaigns - List authenticated sponsor's campaigns
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    const { status, sort, order, search } = req.query;

    const where = {
      sponsorId: user.sponsorId,
      ...(status && { status: status as string as 'ACTIVE' | 'PAUSED' | 'COMPLETED' }),
      ...(search && {
        name: { contains: String(search), mode: 'insensitive' as const },
      }),
    };

    const allowedSorts = ['createdAt', 'budget', 'name', 'status'] as const;
    const sortField = allowedSorts.includes(sort as (typeof allowedSorts)[number])
      ? (sort as string)
      : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';
    const orderBy = { [sortField]: sortOrder };

    const include = {
      sponsor: { select: { id: true, name: true, logo: true } },
      _count: { select: { creatives: true, placements: true } },
    } as const;

    // If page param is present, return paginated response
    if (req.query.page !== undefined) {
      const parsed = parsePagination(req.query as Record<string, string | string[] | undefined>);

      const { campaigns: data, total, page } = await prisma.$transaction(async (tx) => {
        const total = await tx.campaign.count({ where });
        const totalPages = Math.ceil(total / parsed.limit);
        const page = (parsed.page > totalPages && total > 0) ? 1 : parsed.page;
        const skip = (page - 1) * parsed.limit;

        const campaigns = await tx.campaign.findMany({ where, include, orderBy, skip, take: parsed.limit });
        return { campaigns, total, page };
      });

      const totalPages = Math.ceil(total / parsed.limit);
      res.json({ data, pagination: { page, limit: parsed.limit, total, totalPages } });
      return;
    }

    // No page param: return plain array (backward compatibility)
    const campaigns = await prisma.campaign.findMany({ where, include, orderBy });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to fetch campaigns' },
    });
  }
});

// GET /api/campaigns/stats - Aggregated KPI stats for authenticated sponsor
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    if (!user.sponsorId) {
      res.status(403).json({ error: { code: 'FORBIDDEN', status: 403, message: 'Sponsor access required' } });
      return;
    }

    const [totalCampaigns, activeCampaigns, budgetAgg] = await Promise.all([
      prisma.campaign.count({ where: { sponsorId: user.sponsorId } }),
      prisma.campaign.count({ where: { sponsorId: user.sponsorId, status: 'ACTIVE' } }),
      prisma.campaign.aggregate({
        where: { sponsorId: user.sponsorId },
        _sum: { budget: true },
        _avg: { budget: true },
      }),
    ]);

    res.json({
      totalCampaigns,
      activeCampaigns,
      totalBudget: budgetAgg._sum.budget?.toString() ?? '0',
      avgBudget: budgetAgg._avg.budget?.toString() ?? '0',
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to fetch campaign stats' },
    });
  }
});

// GET /api/campaigns/:id - Get single campaign with details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

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

    if (campaign.sponsorId !== user.sponsorId) {
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
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    if (!user.sponsorId) {
      res.status(403).json({ error: { code: 'FORBIDDEN', status: 403, message: 'Only sponsors can create campaigns' } });
      return;
    }

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
        sponsorId: user.sponsorId,
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

// PUT /api/campaigns/:id - Update campaign details
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    const id = getParam(req.params.id);
    const campaign = await prisma.campaign.findUnique({ where: { id } });

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
      status,
    } = req.body;

    // Validate status enum if provided
    if (status !== undefined) {
      const validStatuses = Object.values(CampaignStatus);
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            status: 400,
            message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
          },
        });
        return;
      }
    }

    // Build update data conditionally — only include provided fields
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (budget !== undefined) data.budget = budget;
    if (cpmRate !== undefined) data.cpmRate = cpmRate;
    if (cpcRate !== undefined) data.cpcRate = cpcRate;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = new Date(endDate);
    if (targetCategories !== undefined) data.targetCategories = targetCategories;
    if (targetRegions !== undefined) data.targetRegions = targetRegions;
    if (status !== undefined) data.status = status;

    if (Object.keys(data).length === 0) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          status: 400,
          message: 'At least one field must be provided for update',
        },
      });
      return;
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data,
      include: {
        sponsor: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to update campaign' },
    });
  }
});

// DELETE /api/campaigns/:id - Remove a campaign
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    const id = getParam(req.params.id);
    const campaign = await prisma.campaign.findUnique({ where: { id } });

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

    await prisma.campaign.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to delete campaign' },
    });
  }
});

export default router;
