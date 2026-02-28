import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { AdSlotGrid } from './components/ad-slot-grid';
import { PaginationControls } from './components/pagination-controls';
import { MarketplaceFilters } from './components/marketplace-filters';
import type { AdSlot, PaginationMeta } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Marketplace',
  description:
    'Browse available ad slots from premium publishers. Find the perfect sponsorship opportunity for your brand.',
  openGraph: {
    title: 'Marketplace | Anvara',
    description: 'Browse available ad slots from premium publishers.',
  },
};

import { API_URL } from '@/lib/config';

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MarketplacePage({ searchParams }: Props) {
  const params = await searchParams;
  const rawPage = typeof params.page === 'string' ? parseInt(params.page, 10) : NaN;
  // Invalid/missing page numbers default to 1
  const requestedPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  // Extract filter params
  const search = typeof params.search === 'string' ? params.search : '';
  const type = typeof params.type === 'string' ? params.type : '';
  const sort = typeof params.sort === 'string' ? params.sort : '';
  const order = typeof params.order === 'string' ? params.order : '';
  const available = typeof params.available === 'string' ? params.available : '';

  let adSlots: AdSlot[] = [];
  let pagination: PaginationMeta | null = null;
  let fetchError: string | null = null;

  try {
    const requestHeaders = await headers();
    const fetchParams = new URLSearchParams({
      page: String(requestedPage),
      limit: String(PAGE_SIZE),
    });
    if (search) fetchParams.set('search', search);
    if (type) fetchParams.set('type', type);
    if (sort) fetchParams.set('sort', sort);
    if (order) fetchParams.set('order', order);
    if (available) fetchParams.set('available', available);

    const res = await fetch(`${API_URL}/api/ad-slots?${fetchParams.toString()}`, {
      cache: 'no-store',
      headers: { cookie: requestHeaders.get('cookie') ?? '' },
    });
    if (!res.ok) {
      fetchError = 'Failed to load ad slots';
    } else {
      const body = await res.json();
      adSlots = body.data;
      pagination = body.pagination;
    }
  } catch {
    fetchError = 'Unable to connect to the server. Please try again later.';
  }

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-[var(--color-muted)]">Browse available ad slots from our publishers</p>
      </div>

      <Suspense fallback={null}>
        <MarketplaceFilters />
      </Suspense>

      {fetchError ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">{fetchError}</div>
      ) : (
        <>
          {pagination && pagination.total > 0 && (
            <p className="text-sm text-[var(--color-muted)]">
              Showing {(currentPage - 1) * pagination.limit + 1}–
              {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}{' '}
              results
            </p>
          )}
          <AdSlotGrid adSlots={adSlots} />
          {totalPages > 1 && (
            <Suspense fallback={null}>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                total={pagination?.total ?? 0}
                limit={pagination?.limit ?? PAGE_SIZE}
              />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
