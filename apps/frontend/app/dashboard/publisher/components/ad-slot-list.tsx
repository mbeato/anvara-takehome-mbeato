'use client';

import { motion } from 'motion/react';
import { FADE_IN_UP, STAGGER, DURATION, EASE } from '@/lib/motion';
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
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot, i) => (
        <motion.div
          key={slot.id}
          initial={FADE_IN_UP.initial}
          animate={FADE_IN_UP.animate}
          transition={{
            duration: DURATION.normal,
            ease: EASE.out,
            delay: i * STAGGER.fast,
          }}
        >
          <AdSlotCard adSlot={slot} />
        </motion.div>
      ))}
    </div>
  );
}
