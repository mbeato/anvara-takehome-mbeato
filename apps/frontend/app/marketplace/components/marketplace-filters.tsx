'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  FilterBar,
  type FilterBarConfig,
  type FilterBarValues,
  type SortOption,
} from '@/app/components/filter-bar';
import type { AdSlotType } from '@/lib/types';
import { track } from '@/lib/analytics';

const TYPE_OPTIONS: { label: string; value: AdSlotType }[] = [
  { label: 'Display', value: 'DISPLAY' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Native', value: 'NATIVE' },
  { label: 'Newsletter', value: 'NEWSLETTER' },
  { label: 'Podcast', value: 'PODCAST' },
];

const SORT_OPTIONS: SortOption[] = [
  { label: 'Price High→Low', value: 'basePrice', direction: 'desc' },
  { label: 'Price Low→High', value: 'basePrice', direction: 'asc' },
  { label: 'Newest', value: 'createdAt', direction: 'desc' },
  { label: 'Name A-Z', value: 'name', direction: 'asc' },
];

const filterConfig: FilterBarConfig = {
  searchPlaceholder: 'Search ad slots...',
  dropdowns: [{ key: 'type', label: 'Types', options: TYPE_OPTIONS }],
  toggles: [{ key: 'available', label: 'Available Only' }],
  sortOptions: SORT_OPTIONS,
};

function valuesFromParams(searchParams: URLSearchParams): FilterBarValues {
  const sortField = searchParams.get('sort') ?? '';
  const sortOrder = searchParams.get('order') ?? '';
  const sortIndex = SORT_OPTIONS.findIndex(
    (o) => o.value === sortField && o.direction === sortOrder
  );

  return {
    search: searchParams.get('search') ?? '',
    dropdowns: { type: searchParams.get('type') ?? '' },
    toggles: { available: searchParams.get('available') === 'true' },
    sortIndex: sortIndex >= 0 ? sortIndex : 0,
  };
}

export function MarketplaceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = valuesFromParams(searchParams);

  const handleChange = useCallback(
    (next: FilterBarValues) => {
      const params = new URLSearchParams();

      // Always reset to page 1 on filter change
      params.set('page', '1');

      if (next.search) params.set('search', next.search);
      if (next.dropdowns.type) params.set('type', next.dropdowns.type);

      const sortOpt = SORT_OPTIONS[next.sortIndex];
      if (sortOpt) {
        params.set('sort', sortOpt.value);
        params.set('order', sortOpt.direction);
      }

      if (next.toggles.available) params.set('available', 'true');

      // Track filter interaction (TRCK-05)
      if (next.search) {
        track('filter_used', {
          funnel_step: 'browse',
          filter_type: 'search',
          filter_value: next.search,
        });
      }
      if (next.dropdowns.type) {
        track('filter_used', {
          funnel_step: 'browse',
          filter_type: 'type',
          filter_value: next.dropdowns.type,
        });
      }
      if (sortOpt) {
        track('filter_used', {
          funnel_step: 'browse',
          filter_type: 'sort',
          filter_value: sortOpt.label,
        });
      }
      if (next.toggles.available) {
        track('filter_used', {
          funnel_step: 'browse',
          filter_type: 'toggle',
          filter_value: 'available_only',
        });
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  return <FilterBar config={filterConfig} values={values} onChange={handleChange} />;
}
