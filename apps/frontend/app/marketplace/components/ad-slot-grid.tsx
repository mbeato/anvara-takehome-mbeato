import Link from 'next/link';
import type { AdSlot } from '@/lib/types';
import { EmptyState } from '@/app/components/empty-state';

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
          className="block rounded-lg border border-[var(--color-border)] p-4 transition-shadow hover:shadow-md"
        >
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-semibold">{slot.name}</h3>
            <span
              className={`rounded px-2 py-0.5 text-xs ${typeColors[slot.type] || 'bg-gray-100'}`}
            >
              {slot.type}
            </span>
          </div>

          {slot.publisher && (
            <p className="mb-2 text-sm text-[var(--color-muted)]">by {slot.publisher.name}</p>
          )}

          {slot.description && (
            <p className="mb-3 text-sm text-[var(--color-muted)] line-clamp-2">{slot.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span
              className={`text-sm ${slot.isAvailable ? 'text-green-600' : 'text-[var(--color-muted)]'}`}
            >
              {slot.isAvailable ? 'Available' : 'Booked'}
            </span>
            <span className="font-semibold text-[var(--color-primary)]">
              ${Number(slot.basePrice).toLocaleString()}/mo
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
