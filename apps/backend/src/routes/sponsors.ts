import { Router, type Response, type IRouter } from 'express';
import { requireAuth, type AuthRequest } from '../auth.js';
import { prisma } from '../db.js';

const router: IRouter = Router();

// All sponsor routes require authentication
router.use(requireAuth);

// GET /api/sponsors - Get authenticated user's sponsor profile
router.get('/', async (req: AuthRequest, res: Response) => {
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

    const sponsor = await prisma.sponsor.findUnique({
      where: { id: user.sponsorId },
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
    });

    if (!sponsor) {
      res.status(404).json({ error: { code: 'NOT_FOUND', status: 404, message: 'Sponsor not found' } });
      return;
    }

    res.json(sponsor);
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to fetch sponsor' },
    });
  }
});

// GET /api/sponsors/:id - Get sponsor by ID (ownership enforced)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Sponsors can only view their own profile
    if (user.sponsorId !== id) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', status: 403, message: "You don't own this sponsor profile" },
      });
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
      res.status(404).json({
        error: { code: 'NOT_FOUND', status: 404, message: 'Sponsor not found' },
      });
      return;
    }

    res.json(sponsor);
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to fetch sponsor' },
    });
  }
});

// POST /api/sponsors - Create new sponsor (linked to authenticated user)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    // Users who already have a sponsor profile cannot create another
    if (user.sponsorId) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', status: 400, message: 'You already have a sponsor profile' },
      });
      return;
    }

    const { name, email, website, logo, description, industry } = req.body;

    if (!name || !email) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', status: 400, message: 'Name and email are required' },
      });
      return;
    }

    const sponsor = await prisma.sponsor.create({
      data: { name, email, website, logo, description, industry, userId: user.id },
    });

    res.status(201).json(sponsor);
  } catch (error) {
    console.error('Error creating sponsor:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to create sponsor' },
    });
  }
});

export default router;
