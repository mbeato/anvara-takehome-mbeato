import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { apiError } from './errors.js';

// ============================================================================
// Shared field types
// ============================================================================

/**
 * Accepts positive numbers or numeric strings, coerces to number.
 * Rejects zero, negative values, and non-numeric strings.
 */
export const positiveDecimal = z
  .union([z.number(), z.string()])
  .transform((val) => {
    const num = typeof val === 'string' ? Number(val) : val;
    if (isNaN(num)) throw new Error('Must be a valid number');
    if (num <= 0) throw new Error('Must be a positive number');
    return num;
  });

/** ISO date string field - validates it can be parsed as a valid date */
const dateString = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Must be a valid date string' },
);

// ============================================================================
// Campaign schemas
// ============================================================================

export const createCampaignSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    budget: positiveDecimal,
    cpmRate: positiveDecimal.optional(),
    cpcRate: positiveDecimal.optional(),
    startDate: dateString,
    endDate: dateString,
    targetCategories: z.array(z.string()).optional(),
    targetRegions: z.array(z.string()).optional(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'startDate must be before endDate',
    path: ['endDate'],
  });

export const updateCampaignSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
    budget: positiveDecimal.optional(),
    cpmRate: positiveDecimal.optional(),
    cpcRate: positiveDecimal.optional(),
    startDate: dateString.optional(),
    endDate: dateString.optional(),
    targetCategories: z.array(z.string()).optional(),
    targetRegions: z.array(z.string()).optional(),
    status: z
      .enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    { message: 'startDate must be before endDate', path: ['endDate'] },
  );

// ============================================================================
// AdSlot schemas
// ============================================================================

export const createAdSlotSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST']),
  position: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  basePrice: positiveDecimal,
});

export const updateAdSlotSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  type: z.enum(['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST']).optional(),
  position: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  basePrice: positiveDecimal.optional(),
  cpmFloor: positiveDecimal.optional(),
  isAvailable: z.boolean().optional(),
});

// ============================================================================
// Placement schemas
// ============================================================================

export const createPlacementSchema = z
  .object({
    campaignId: z.string().min(1, 'campaignId is required'),
    creativeId: z.string().min(1, 'creativeId is required'),
    adSlotId: z.string().min(1, 'adSlotId is required'),
    publisherId: z.string().min(1, 'publisherId is required'),
    agreedPrice: positiveDecimal,
    pricingModel: z.enum(['CPM', 'CPC', 'CPA', 'FLAT_RATE']).optional(),
    startDate: dateString,
    endDate: dateString,
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'startDate must be before endDate',
    path: ['endDate'],
  });

// ============================================================================
// Sponsor schemas
// ============================================================================

export const createSponsorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email'),
  website: z.string().url('Must be a valid URL').optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
});

export const updateSponsorSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Must be a valid email').optional(),
  website: z.string().url('Must be a valid URL').optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
});

// ============================================================================
// Middleware
// ============================================================================

/** Format Zod error issues into a human-readable string */
function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    })
    .join('; ');
}

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * On success: replaces req.body with parsed/coerced data and calls next().
 * On failure: returns 400 with VALIDATION_ERROR code.
 */
export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json(apiError(400, 'VALIDATION_ERROR', formatZodError(result.error)));
      return;
    }
    req.body = result.data;
    next();
  };
}
