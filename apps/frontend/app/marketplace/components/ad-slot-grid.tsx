'use client';

import Link from 'next/link';
import type { AdSlot } from '@/lib/types';
import { EmptyState } from '@/app/components/empty-state';
import { trackMarketplaceClick } from '@/lib/analytics';
import { useTrackView } from '@/app/hooks/use-track-view';
import { formatCompactNumber } from '@/lib/utils';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

interface Props {
  adSlots: AdSlot[];
}

export function AdSlotGrid({ adSlots }: Props) {
  useTrackView('marketplace_view', {
    funnel_step: 'browse',
    total_results: adSlots.length,
  });

  if (adSlots.length === 0) {
    return (
      <EmptyState
        heading="No ad slots available"
        description="There are no ad slots listed at the moment. Check back soon for new opportunities from our publishers."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot) => (
        <Link
          key={slot.id}
          href={`/marketplace/${slot.id}`}
          onClick={() => trackMarketplaceClick(slot.id)}
          className="block rounded-lg border border-[var(--color-border)] p-4 transition-shadow hover:shadow-md"
        >
          {/* Badges */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs ${typeColors[slot.type] || 'bg-gray-100'}`}
            >
              {slot.type}
            </span>
            {slot._count && slot._count.placements > 0 && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                Popular
              </span>
            )}
            {slot.publisher?.isVerified && (
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                Verified
              </span>
            )}
          </div>

          {/* Title + Price */}
          <h3 className="font-semibold">{slot.name}</h3>
          <p className="text-lg font-bold text-[var(--color-primary)]">
            ${Number(slot.basePrice).toLocaleString()}/mo
          </p>

          {/* Publisher + Audience Metrics */}
          {slot.publisher && (
            <div className="mt-1 text-sm text-[var(--color-muted)]">
              <span>{slot.publisher.name}</span>
              {slot.publisher.monthlyViews != null && slot.publisher.monthlyViews > 0 && (
                <span> · {formatCompactNumber(slot.publisher.monthlyViews)} views/mo</span>
              )}
              {slot.publisher.subscriberCount != null && slot.publisher.subscriberCount > 0 && (
                <span> · {formatCompactNumber(slot.publisher.subscriberCount)} subscribers</span>
              )}
            </div>
          )}

          {/* Availability */}
          <div className="mt-3 text-sm">
            {slot.isAvailable ? (
              <span className="text-green-600">
                {slot._count && slot._count.placements > 0 ? 'Available \u00b7 In Demand' : 'Available'}
              </span>
            ) : (
              <span className="text-[var(--color-muted)]">Currently Booked</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
