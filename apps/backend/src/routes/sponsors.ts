import { Router, type Response, type IRouter } from 'express';
import { requireAuth, type AuthRequest } from '../auth.js';
import { prisma } from '../db.js';
import { apiError } from '../utils/errors.js';
import { validate, createSponsorSchema, updateSponsorSchema } from '../utils/validation.js';
import { logger } from '../logger.js';

const router: IRouter = Router();

// All sponsor routes require authentication
router.use(requireAuth);

// GET /api/sponsors - Get authenticated user's sponsor profile
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json(apiError(401, 'UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    if (!user.sponsorId) {
      res.status(403).json(apiError(403, 'FORBIDDEN', 'Sponsor access required'));
      return;
    }

    const sponsor = await prisma.sponsor.findUnique({
      where: { id: user.sponsorId },
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
    });

    if (!sponsor) {
      res.status(404).json(apiError(404, 'NOT_FOUND', 'Sponsor not found'));
      return;
    }

    res.json(sponsor);
  } catch (error) {
    logger.error('Error fetching sponsor:', error);
    res.status(500).json(apiError(500, 'INTERNAL_ERROR', 'Failed to fetch sponsor'));
  }
});

// GET /api/sponsors/:id - Get sponsor by ID (ownership enforced)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json(apiError(401, 'UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Sponsors can only view their own profile
    if (user.sponsorId !== id) {
      res.status(403).json(apiError(403, 'FORBIDDEN', "You don't own this sponsor profile"));
      return;
    }

    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
      include: {
        campaigns: {
          include: {
            _count: { select: { placements: true } },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!sponsor) {
      res.status(404).json(apiError(404, 'NOT_FOUND', 'Sponsor not found'));
      return;
    }

    res.json(sponsor);
  } catch (error) {
    logger.error('Error fetching sponsor:', error);
    res.status(500).json(apiError(500, 'INTERNAL_ERROR', 'Failed to fetch sponsor'));
  }
});

// POST /api/sponsors - Create new sponsor (linked to authenticated user)
router.post('/', validate(createSponsorSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json(apiError(401, 'UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    // Users who already have a sponsor profile cannot create another
    if (user.sponsorId) {
      res.status(400).json(apiError(400, 'VALIDATION_ERROR', 'You already have a sponsor profile'));
      return;
    }

    const { name, email, website, logo, description, industry } = req.body;

    const sponsor = await prisma.sponsor.create({
      data: { name, email, website, logo, description, industry, userId: user.id },
    });

    res.status(201).json(sponsor);
  } catch (error) {
    logger.error('Error creating sponsor:', error);
    res.status(500).json(apiError(500, 'INTERNAL_ERROR', 'Failed to create sponsor'));
  }
});

// PUT /api/sponsors/:id - Update sponsor (ownership enforced)
router.put('/:id', validate(updateSponsorSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json(apiError(401, 'UNAUTHORIZED', 'Not authenticated'));
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Sponsors can only update their own profile
    if (user.sponsorId !== id) {
      res.status(403).json(apiError(403, 'FORBIDDEN', "You don't own this sponsor profile"));
      return;
    }

    const sponsor = await prisma.sponsor.findUnique({ where: { id } });
    if (!sponsor) {
      res.status(404).json(apiError(404, 'NOT_FOUND', 'Sponsor not found'));
      return;
    }

    const { name, email, website, logo, description, industry } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (website !== undefined) data.website = website;
    if (logo !== undefined) data.logo = logo;
    if (description !== undefined) data.description = description;
    if (industry !== undefined) data.industry = industry;

    if (Object.keys(data).length === 0) {
      res.status(400).json(apiError(400, 'VALIDATION_ERROR', 'At least one field must be provided for update'));
      return;
    }

    const updated = await prisma.sponsor.update({ where: { id }, data });
    res.json(updated);
  } catch (error) {
    logger.error('Error updating sponsor:', error);
    res.status(500).json(apiError(500, 'INTERNAL_ERROR', 'Failed to update sponsor'));
  }
});

export default router;
