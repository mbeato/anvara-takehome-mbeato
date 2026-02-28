// Application-level DTOs for all API endpoints
// These decouple API responses from Prisma internals.
// Prisma Decimal -> string (JSON serialization), DateTime -> string (ISO format)

import type {
  CampaignStatus as PrismaCampaignStatus,
  AdSlotType as PrismaAdSlotType,
  PlacementStatus as PrismaPlacementStatus,
  PricingModel as PrismaPricingModel,
  SubscriptionTier as PrismaSubscriptionTier,
  CreativeType as PrismaCreativeType,
  PaymentType as PrismaPaymentType,
  PaymentStatus as PrismaPaymentStatus,
} from '../generated/prisma/client.js';

// Re-export enums so consumers don't import from generated code directly
export {
  CampaignStatus,
  AdSlotType,
  PlacementStatus,
  PricingModel,
  SubscriptionTier,
  CreativeType,
  PaymentType,
  PaymentStatus,
} from '../generated/prisma/client.js';

// ============================================================================
// Sponsor DTOs
// ============================================================================

export interface SponsorResponseDto {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  website: string | null;
  logo: string | null;
  description: string | null;
  industry: string | null;
  subscriptionTier: PrismaSubscriptionTier;
  subscriptionEndsAt: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Publisher DTOs
// ============================================================================

export interface PublisherResponseDto {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  website: string | null;
  avatar: string | null;
  bio: string | null;
  monthlyViews: number;
  subscriberCount: number;
  category: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Campaign DTOs
// ============================================================================

export interface CampaignResponseDto {
  id: string;
  name: string;
  description: string | null;
  budget: string;
  spent: string;
  cpmRate: string | null;
  cpcRate: string | null;
  startDate: string;
  endDate: string;
  targetCategories: string[];
  targetRegions: string[];
  status: PrismaCampaignStatus;
  createdAt: string;
  updatedAt: string;
  sponsorId: string;
}

export interface CreateCampaignRequestDto {
  name: string;
  description?: string;
  budget: string;
  cpmRate?: string;
  cpcRate?: string;
  startDate: string;
  endDate: string;
  targetCategories?: string[];
  targetRegions?: string[];
  sponsorId?: string; // Derived from session on the backend; not sent by clients
}

// ============================================================================
// Creative DTOs
// ============================================================================

export interface CreativeResponseDto {
  id: string;
  name: string;
  type: PrismaCreativeType;
  assetUrl: string;
  clickUrl: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  campaignId: string;
}

// ============================================================================
// Ad Slot DTOs
// ============================================================================

export interface AdSlotResponseDto {
  id: string;
  name: string;
  description: string | null;
  type: PrismaAdSlotType;
  position: string | null;
  width: number | null;
  height: number | null;
  basePrice: string;
  cpmFloor: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  publisherId: string;
}

export interface CreateAdSlotRequestDto {
  name: string;
  description?: string;
  type: PrismaAdSlotType;
  position?: string;
  width?: number;
  height?: number;
  basePrice: string;
  publisherId?: string; // Derived from session on the backend; not sent by clients
}

// ============================================================================
// Placement DTOs
// ============================================================================

export interface PlacementResponseDto {
  id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  agreedPrice: string;
  pricingModel: PrismaPricingModel;
  startDate: string;
  endDate: string;
  status: PrismaPlacementStatus;
  createdAt: string;
  updatedAt: string;
  campaignId: string;
  creativeId: string;
  adSlotId: string;
  publisherId: string;
}

export interface CreatePlacementRequestDto {
  campaignId: string;
  creativeId: string;
  adSlotId: string;
  publisherId: string;
  agreedPrice: string;
  pricingModel?: PrismaPricingModel;
  startDate: string;
  endDate: string;
}

// ============================================================================
// Payment DTOs
// ============================================================================

export interface PaymentResponseDto {
  id: string;
  amount: string;
  currency: string;
  type: PrismaPaymentType;
  status: PrismaPaymentStatus;
  stripePaymentId: string | null;
  invoiceUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  sponsorId: string;
}

// ============================================================================
// Dashboard DTOs
// ============================================================================

export interface DashboardMetricsDto {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: string;
}

export interface DashboardStatsDto {
  sponsors: number;
  publishers: number;
  activeCampaigns: number;
  totalPlacements: number;
  metrics: DashboardMetricsDto;
}
