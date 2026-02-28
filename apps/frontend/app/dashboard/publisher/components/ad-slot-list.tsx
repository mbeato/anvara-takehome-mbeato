'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { FADE_IN_UP, STAGGER, DURATION, EASE } from '@/lib/motion';
import type { AdSlot, AdSlotType } from '@/lib/types';
import { EmptyState } from '@/app/components/empty-state';
import {
  FilterBar,
  initialFilterValues,
  type FilterBarConfig,
  type FilterBarValues,
} from '@/app/components/filter-bar';
import { AdSlotCard } from './ad-slot-card';
import { CreateAdSlotButton } from './ad-slot-form';

const TYPE_OPTIONS: { label: string; value: AdSlotType }[] = [
  { label: 'Display', value: 'DISPLAY' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Native', value: 'NATIVE' },
  { label: 'Newsletter', value: 'NEWSLETTER' },
  { label: 'Podcast', value: 'PODCAST' },
];

const filterConfig: FilterBarConfig = {
  searchPlaceholder: 'Search ad slots...',
  dropdowns: [{ key: 'type', label: 'Types', options: TYPE_OPTIONS }],
  toggles: [{ key: 'available', label: 'Available only' }],
  sortOptions: [
    { label: 'Newest', value: 'createdAt', direction: 'desc' },
    { label: 'Oldest', value: 'createdAt', direction: 'asc' },
    { label: 'Price High→Low', value: 'basePrice', direction: 'desc' },
    { label: 'Price Low→High', value: 'basePrice', direction: 'asc' },
    { label: 'Name A-Z', value: 'name', direction: 'asc' },
    { label: 'Name Z-A', value: 'name', direction: 'desc' },
  ],
};

interface AdSlotListProps {
  adSlots: AdSlot[];
}

export function AdSlotList({ adSlots }: AdSlotListProps) {
  const [filters, setFilters] = useState<FilterBarValues>(() => initialFilterValues(filterConfig));

  const filtered = useMemo(() => {
    let result = adSlots;

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }

    // Type dropdown
    const type = filters.dropdowns.type;
    if (type) {
      result = result.filter((s) => s.type === type);
    }

    // Available toggle
    if (filters.toggles.available) {
      result = result.filter((s) => s.isAvailable);
    }

    // Sort
    const sortOpt = filterConfig.sortOptions?.[filters.sortIndex];
    if (sortOpt) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        const field = sortOpt.value as keyof AdSlot;
        const av = a[field];
        const bv = b[field];
        if (field === 'basePrice') {
          cmp = parseFloat(String(av)) - parseFloat(String(bv));
        } else {
          cmp = String(av).localeCompare(String(bv));
        }
        return sortOpt.direction === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }, [adSlots, filters]);

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
    <div className="space-y-5">
      <FilterBar config={filterConfig} values={filters} onChange={setFilters} />

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-muted)]">No matching ad slots</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((slot, i) => (
            <motion.div
              key={slot.id}
              initial={FADE_IN_UP.initial}
              animate={FADE_IN_UP.animate}
              transition={{
                duration: DURATION.normal,
                ease: EASE.out,
                delay: Math.floor(i / 3) * STAGGER.fast,
              }}
            >
              <AdSlotCard adSlot={slot} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
