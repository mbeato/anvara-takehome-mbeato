// Frontend type definitions matching backend DTO contract
// Prisma Decimal -> string (JSON serialization), DateTime -> string (ISO format)
// Frontend does NOT import from Prisma; these are standalone string-literal union types

// ============================================================================
// Enums (string literal unions matching Prisma schema)
// ============================================================================

export type UserRole = 'sponsor' | 'publisher';

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export type CreativeType = 'BANNER' | 'VIDEO' | 'NATIVE' | 'SPONSORED_POST' | 'PODCAST_READ';

export type AdSlotType = 'DISPLAY' | 'VIDEO' | 'NATIVE' | 'NEWSLETTER' | 'PODCAST';

export type PricingModel = 'CPM' | 'CPC' | 'CPA' | 'FLAT_RATE';

export type PlacementStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'REJECTED';

export type PaymentType = 'SUBSCRIPTION' | 'CAMPAIGN_FUNDING' | 'REFUND';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// ============================================================================
// Sponsor
// ============================================================================

export interface Sponsor {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  website: string | null;
  logo: string | null;
  description: string | null;
  industry: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionEndsAt: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Publisher
// ============================================================================

export interface Publisher {
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
// Campaign
// ============================================================================

export interface Campaign {
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
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  sponsorId: string;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  budget: string;
  cpmRate?: string;
  cpcRate?: string;
  startDate: string;
  endDate: string;
  targetCategories?: string[];
  targetRegions?: string[];
  sponsorId: string;
}

// ============================================================================
// Creative
// ============================================================================

export interface Creative {
  id: string;
  name: string;
  type: CreativeType;
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
// Ad Slot
// ============================================================================

export interface AdSlot {
  id: string;
  name: string;
  description: string | null;
  type: AdSlotType;
  position: string | null;
  width: number | null;
  height: number | null;
  basePrice: string;
  cpmFloor: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  publisherId: string;
  publisher?: {
    id: string;
    name: string;
    website?: string | null;
    monthlyViews?: number;
    subscriberCount?: number;
    category?: string | null;
    isVerified?: boolean;
  };
  _count?: { placements: number };
}

export interface CreateAdSlotRequest {
  name: string;
  description?: string;
  type: AdSlotType;
  position?: string;
  width?: number;
  height?: number;
  basePrice: string;
  publisherId: string;
}

// ============================================================================
// Placement
// ============================================================================

export interface Placement {
  id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  agreedPrice: string;
  pricingModel: PricingModel;
  startDate: string;
  endDate: string;
  status: PlacementStatus;
  createdAt: string;
  updatedAt: string;
  campaignId: string;
  creativeId: string;
  adSlotId: string;
  publisherId: string;
}

export interface CreatePlacementRequest {
  campaignId: string;
  creativeId: string;
  adSlotId: string;
  publisherId: string;
  agreedPrice: string;
  pricingModel?: PricingModel;
  startDate: string;
  endDate: string;
}

// ============================================================================
// Payment
// ============================================================================

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  stripePaymentId: string | null;
  invoiceUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  sponsorId: string;
}

// ============================================================================
// Dashboard
// ============================================================================

export interface DashboardMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: string;
}

export interface DashboardStats {
  sponsors: number;
  publishers: number;
  activeCampaigns: number;
  totalPlacements: number;
  metrics: DashboardMetrics;
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export type PaginatedAdSlotResponse = PaginatedResponse<AdSlot>;

// ============================================================================
// Featured Listings (landing page)
// ============================================================================

export interface FeaturedListing {
  id: string;
  name: string;
  type: string;
  basePrice: string;
  publisher: { id: string; name: string };
}

export interface FeaturedListingsPagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface FeaturedListingsResponse {
  data: FeaturedListing[];
  pagination: FeaturedListingsPagination;
}

// ============================================================================
// Dashboard KPI Stats
// ============================================================================

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: string; // Decimal serialized as string
  avgBudget: string; // Decimal serialized as string
}

export interface AdSlotStats {
  totalSlots: number;
  activeSlots: number;
  totalRevenue: string; // Decimal serialized as string
  avgPrice: string; // Decimal serialized as string
}
