import crypto from 'node:crypto';
import { Router, type Request, type Response, type IRouter } from 'express';
import { logger } from '../logger.js';

const router: IRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_BUDGETS = ['$500-$1k', '$1k-$5k', '$5k-$10k', '$10k+'];
const VALID_TIMELINES = ['ASAP', '1-2 weeks', '1 month', 'Flexible'];

// POST /api/quotes/request - Quote request (public, no auth, no DB)
router.post('/request', (req: Request, res: Response) => {
  const {
    email,
    companyName,
    budgetRange,
    adSlotId,
    timeline,
  } = req.body;

  // Validate required fields
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        status: 400,
        message: 'Please provide a valid email address',
      },
    });
    return;
  }

  if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        status: 400,
        message: 'Company name is required',
      },
    });
    return;
  }

  if (!budgetRange || !VALID_BUDGETS.includes(budgetRange)) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        status: 400,
        message: 'Please select a valid budget range',
      },
    });
    return;
  }

  if (!adSlotId || typeof adSlotId !== 'string') {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        status: 400,
        message: 'Ad slot ID is required',
      },
    });
    return;
  }

  if (timeline && !VALID_TIMELINES.includes(timeline)) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        status: 400,
        message: 'Please select a valid timeline',
      },
    });
    return;
  }

  const quoteId = `QR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  logger.info(
    `Quote request ${quoteId} for ad slot ${adSlotId} from ${companyName} (${email})`
  );

  res.json({ success: true, quoteId });
});

export default router;
