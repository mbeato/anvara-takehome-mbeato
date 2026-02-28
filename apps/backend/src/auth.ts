import { type Request, type Response, type NextFunction } from 'express';
import { betterAuth } from 'better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { Pool } from 'pg';
import { prisma } from './db.js';

// ============================================================================
// Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  role: 'SPONSOR' | 'PUBLISHER';
  sponsorId?: string;
  publisherId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// ============================================================================
// Better Auth instance (shares DB + secret with frontend)
// ============================================================================

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

const authSecret = process.env.BETTER_AUTH_SECRET;
if (!authSecret && process.env.NODE_ENV === 'production') {
  throw new Error('BETTER_AUTH_SECRET environment variable is required in production');
}

export const auth = betterAuth({
  database: new Pool({ connectionString: databaseUrl }),
  secret: authSecret || 'dev-only-insecure-secret',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3847',
  emailAndPassword: { enabled: true },
  advanced: { disableCSRFCheck: true },
});

// ============================================================================
// requireAuth middleware
// ============================================================================

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          status: 401,
          message: 'Valid session required',
        },
      });
      return;
    }

    const [sponsor, publisher] = await Promise.all([
      prisma.sponsor.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      }),
      prisma.publisher.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      }),
    ]);

    if (sponsor) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: 'SPONSOR',
        sponsorId: sponsor.id,
      };
    } else if (publisher) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: 'PUBLISHER',
        publisherId: publisher.id,
      };
    } else {
      res.status(403).json({
        error: {
          code: 'NO_ROLE',
          status: 403,
          message: 'User has no assigned role',
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        status: 401,
        message: 'Session validation failed',
      },
    });
  }
}
