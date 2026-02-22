import type { AdSlot } from '@/lib/types';
import { EmptyState } from '@/app/components/empty-state';
import { AdSlotCard } from './ad-slot-card';
import { CreateAdSlotButton } from './ad-slot-form';

interface AdSlotListProps {
  adSlots: AdSlot[];
}

export function AdSlotList({ adSlots }: AdSlotListProps) {
  if (adSlots.length === 0) {
    return (
      <EmptyState
        heading="No ad slots yet"
        description="Create your first ad slot to start connecting with sponsors and earning revenue."
        action={<CreateAdSlotButton />}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot) => (
        <AdSlotCard key={slot.id} adSlot={slot} />
      ))}
    </div>
  );
}
