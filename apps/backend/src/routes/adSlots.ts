import { Router, type Response, type IRouter } from 'express';
import { requireAuth, type AuthRequest } from '../auth.js';
import { prisma, AdSlotType } from '../db.js';
import { getParam, parsePagination } from '../utils/helpers.js';

const router: IRouter = Router();

// All ad-slot routes require authentication
router.use(requireAuth);

// GET /api/ad-slots - List ad slots
// Publishers see only their own ad slots (dashboard)
// Sponsors see all ad slots (marketplace browsing)
// Optional pagination: pass ?page=1&limit=12 to get { data, pagination } response
// Without page param: returns plain array (backward compatibility for publisher dashboard)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    const { type, available } = req.query;

    const where = {
      ...(user.role === 'PUBLISHER' && { publisherId: user.publisherId }),
      ...(type && {
        type: type as string as 'DISPLAY' | 'VIDEO' | 'NATIVE' | 'NEWSLETTER' | 'PODCAST',
      }),
      ...(available === 'true' && { isAvailable: true }),
    };

    const include = {
      publisher: { select: { id: true, name: true, category: true, monthlyViews: true } },
      _count: { select: { placements: true } },
    } as const;

    const orderBy = { basePrice: 'desc' } as const;

    // If page param is present, return paginated response
    if (req.query.page !== undefined) {
      const parsed = parsePagination(req.query as Record<string, string | string[] | undefined>);
      const limit = parsed.limit === 10 && !req.query.limit ? 12 : parsed.limit; // default 12 per page

      const { adSlots, total, page } = await prisma.$transaction(async (tx) => {
        const total = await tx.adSlot.count({ where });
        const totalPages = Math.ceil(total / limit);

        // Clamp invalid page numbers to page 1
        const page = (parsed.page > totalPages && total > 0) ? 1 : parsed.page;
        const skip = (page - 1) * limit;

        const adSlots = await tx.adSlot.findMany({ where, include, orderBy, skip, take: limit });

        return { adSlots, total, page };
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        data: adSlots,
        pagination: { page, limit, total, totalPages },
      });
      return;
    }

    // No page param: return plain array (backward compatibility for publisher dashboard)
    const adSlots = await prisma.adSlot.findMany({ where, include, orderBy });
    res.json(adSlots);
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to fetch ad slots' },
    });
  }
});

// GET /api/ad-slots/:id - Get single ad slot with details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    const id = getParam(req.params.id);
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: {
        publisher: true,
        placements: {
          include: {
            campaign: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });

    if (!adSlot) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', status: 404, message: 'Ad slot not found' },
      });
      return;
    }

    // Publishers can only view their own ad slots; sponsors can view any (marketplace)
    if (user.role === 'PUBLISHER' && adSlot.publisherId !== user.publisherId) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', status: 403, message: "You don't own this ad slot" },
      });
      return;
    }

    res.json(adSlot);
  } catch (error) {
    console.error('Error fetching ad slot:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to fetch ad slot' },
    });
  }
});

// POST /api/ad-slots - Create new ad slot
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    // Only publishers can create ad slots
    if (!user.publisherId) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', status: 403, message: 'Only publishers can create ad slots' },
      });
      return;
    }

    const { name, description, type, position, width, height, basePrice } = req.body;

    if (!name || !type || !basePrice) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          status: 400,
          message: 'Name, type, and basePrice are required',
        },
      });
      return;
    }

    if (!Object.values(AdSlotType).includes(type as AdSlotType)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          status: 400,
          message: `Invalid type. Must be one of: ${Object.values(AdSlotType).join(', ')}`,
        },
      });
      return;
    }

    const adSlot = await prisma.adSlot.create({
      data: {
        name,
        description,
        type,
        position,
        width: width != null ? parseInt(String(width), 10) : undefined,
        height: height != null ? parseInt(String(height), 10) : undefined,
        basePrice,
        publisherId: user.publisherId,
      },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(adSlot);
  } catch (error) {
    console.error('Error creating ad slot:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to create ad slot' },
    });
  }
});

// PUT /api/ad-slots/:id - Update an ad slot
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    const id = getParam(req.params.id);

    const adSlot = await prisma.adSlot.findUnique({ where: { id } });

    if (!adSlot) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', status: 404, message: 'Ad slot not found' },
      });
      return;
    }

    if (adSlot.publisherId !== user.publisherId) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', status: 403, message: "You don't own this ad slot" },
      });
      return;
    }

    const { name, description, type, position, width, height, basePrice, cpmFloor, isAvailable } =
      req.body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (type !== undefined) data.type = type;
    if (position !== undefined) data.position = position;
    if (width !== undefined) data.width = parseInt(String(width), 10);
    if (height !== undefined) data.height = parseInt(String(height), 10);
    if (basePrice !== undefined) data.basePrice = basePrice;
    if (cpmFloor !== undefined) data.cpmFloor = cpmFloor;
    if (isAvailable !== undefined) data.isAvailable = isAvailable;

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

    if (type !== undefined && !Object.values(AdSlotType).includes(type as AdSlotType)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          status: 400,
          message: `Invalid type. Must be one of: ${Object.values(AdSlotType).join(', ')}`,
        },
      });
      return;
    }

    const updated = await prisma.adSlot.update({
      where: { id },
      data,
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating ad slot:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to update ad slot' },
    });
  }
});

// DELETE /api/ad-slots/:id - Delete an ad slot
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    const id = getParam(req.params.id);

    const adSlot = await prisma.adSlot.findUnique({ where: { id } });

    if (!adSlot) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', status: 404, message: 'Ad slot not found' },
      });
      return;
    }

    if (adSlot.publisherId !== user.publisherId) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', status: 403, message: "You don't own this ad slot" },
      });
      return;
    }

    await prisma.adSlot.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ad slot:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to delete ad slot' },
    });
  }
});

// POST /api/ad-slots/:id/book - Book an ad slot (simplified booking flow)
// This is a sponsor action -- any authenticated sponsor can book an available slot
router.post('/:id/book', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', status: 401, message: 'Not authenticated' } });
      return;
    }

    const id = getParam(req.params.id);
    const { message } = req.body;

    // Only sponsors can book ad slots
    const authenticatedSponsorId = user.sponsorId;
    if (!authenticatedSponsorId) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', status: 403, message: 'Only sponsors can book ad slots' },
      });
      return;
    }

    // Check if slot exists and is available
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: { publisher: true },
    });

    if (!adSlot) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', status: 404, message: 'Ad slot not found' },
      });
      return;
    }

    if (!adSlot.isAvailable) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          status: 400,
          message: 'Ad slot is no longer available',
        },
      });
      return;
    }

    // Mark slot as unavailable
    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: false },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    console.log(
      `Ad slot ${id} booked by sponsor ${authenticatedSponsorId}. Message: ${message || 'None'}`
    );

    res.json({
      success: true,
      message: 'Ad slot booked successfully!',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error booking ad slot:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to book ad slot' },
    });
  }
});

// POST /api/ad-slots/:id/unbook - Reset ad slot to available (for testing)
router.post('/:id/unbook', async (req: AuthRequest, res: Response) => {
  try {
    const id = getParam(req.params.id);

    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: true },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      message: 'Ad slot is now available again',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error unbooking ad slot:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', status: 500, message: 'Failed to unbook ad slot' },
    });
  }
});

export default router;
