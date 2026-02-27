/** Single source of truth for an A/B test experiment */
export interface ExperimentConfig {
  /** Unique experiment identifier, used in cookie name: ab_[name] */
  name: string;
  /** Variant identifiers -- first variant is the control */
  variants: string[];
  /** Weight distribution (must match variants length, values are relative -- e.g., [50, 50] or [90, 10]) */
  weights: number[];
  /** Human-readable description for debug output */
  description?: string;
}

/** Registry of all active experiments. Phase 21 will add the live CTA test here. */
export const EXPERIMENTS: ExperimentConfig[] = [
  // {
  //   name: 'cta-copy',
  //   variants: ['A', 'B'],
  //   weights: [50, 50],
  //   description: 'Detail page CTA text variation',
  // },
];

/** Named funnel steps for structured analytics */
export type FunnelStep = 'browse' | 'view' | 'engage' | 'convert';

/** Typed GA4 ecommerce item -- enforces required fields */
export interface GA4Item {
  item_id: string;
  item_name: string;
  price: number;
  currency: string;
  item_category?: string;
  item_brand?: string;
  quantity?: number;
}

/** Build a GA4-compliant item from marketplace ad slot data */
export function toGA4Item(adSlot: {
  id: string;
  name: string;
  basePrice: string;
  type?: string;
  publisher?: { name: string };
}): GA4Item {
  return {
    item_id: adSlot.id,
    item_name: adSlot.name,
    price: Number(adSlot.basePrice),
    currency: 'USD',
    item_category: adSlot.type,
    item_brand: adSlot.publisher?.name,
  };
}

/** Weighted random variant selection. Pure function, edge-compatible. */
export function weightedRandom(variants: string[], weights: number[]): string {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < variants.length; i++) {
    random -= weights[i];
    if (random <= 0) return variants[i];
  }

  return variants[0]; // Fallback to first variant
}

/** Read a single cookie value by name from document.cookie */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Get all active A/B variant cookies as a flat object for analytics enrichment */
export function getActiveVariants(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  const variants: Record<string, string> = {};
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, val] = cookie.split('=');
    if (key?.startsWith('ab_') && val) {
      // Convert cookie name to GA4-safe param: ab_cta-copy -> ab_cta_copy
      variants[key.replace(/-/g, '_')] = decodeURIComponent(val);
    }
  }
  return variants;
}
