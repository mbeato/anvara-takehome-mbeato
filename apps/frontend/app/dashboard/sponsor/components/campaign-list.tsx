'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { FADE_IN_UP, STAGGER, DURATION, EASE } from '@/lib/motion';
import type { Campaign, CampaignStatus } from '@/lib/types';
import { EmptyState } from '@/app/components/empty-state';
import { FilterBar, initialFilterValues, type FilterBarConfig, type FilterBarValues } from '@/app/components/filter-bar';
import { CampaignCard } from './campaign-card';
import { CreateCampaignButton } from './campaign-form';

const STATUS_OPTIONS: { label: string; value: CampaignStatus }[] = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Pending Review', value: 'PENDING_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Paused', value: 'PAUSED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const filterConfig: FilterBarConfig = {
  searchPlaceholder: 'Search campaigns...',
  dropdowns: [{ key: 'status', label: 'Statuses', options: STATUS_OPTIONS }],
  sortOptions: [
    { label: 'Newest', value: 'createdAt', direction: 'desc' },
    { label: 'Oldest', value: 'createdAt', direction: 'asc' },
    { label: 'Budget High→Low', value: 'budget', direction: 'desc' },
    { label: 'Budget Low→High', value: 'budget', direction: 'asc' },
    { label: 'Name A-Z', value: 'name', direction: 'asc' },
    { label: 'Name Z-A', value: 'name', direction: 'desc' },
    { label: 'Status', value: 'status', direction: 'asc' },
  ],
};

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  const [filters, setFilters] = useState<FilterBarValues>(() => initialFilterValues(filterConfig));

  const filtered = useMemo(() => {
    let result = campaigns;

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    // Status dropdown
    const status = filters.dropdowns.status;
    if (status) {
      result = result.filter((c) => c.status === status);
    }

    // Sort
    const sortOpt = filterConfig.sortOptions?.[filters.sortIndex];
    if (sortOpt) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        const field = sortOpt.value as keyof Campaign;
        const av = a[field];
        const bv = b[field];
        if (field === 'budget') {
          cmp = parseFloat(String(av)) - parseFloat(String(bv));
        } else {
          cmp = String(av).localeCompare(String(bv));
        }
        return sortOpt.direction === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }, [campaigns, filters]);

  if (campaigns.length === 0) {
    return (
      <EmptyState
        heading="No campaigns yet"
        description="Create your first campaign to start reaching your target audience through premium publishers."
        action={<CreateCampaignButton />}
      />
    );
  }

  return (
    <div className="space-y-5">
      <FilterBar config={filterConfig} values={filters} onChange={setFilters} />

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-[var(--color-muted)]">No matching campaigns</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={FADE_IN_UP.initial}
              animate={FADE_IN_UP.animate}
              transition={{
                duration: DURATION.normal,
                ease: EASE.out,
                delay: Math.floor(i / 3) * STAGGER.fast,
              }}
            >
              <CampaignCard campaign={campaign} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
