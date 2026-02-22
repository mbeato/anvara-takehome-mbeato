import { Router, type Request, type Response, type IRouter } from 'express';

const router: IRouter = Router();

// POST /api/newsletter/subscribe - Newsletter signup (public, no auth)
router.post('/subscribe', (req: Request, res: Response) => {
  const { email } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        status: 400,
        message: 'Please provide a valid email address',
      },
    });
    return;
  }

  // Dummy endpoint -- no database persistence
  res.json({
    success: true,
    message: 'Thanks for subscribing!',
  });
});

export default router;
