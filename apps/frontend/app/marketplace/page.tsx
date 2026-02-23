import { headers } from 'next/headers';
import { Suspense } from 'react';
import { AdSlotGrid } from './components/ad-slot-grid';
import { PaginationControls } from './components/pagination-controls';
import type { AdSlot, PaginationMeta } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';
const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MarketplacePage({ searchParams }: Props) {
  const params = await searchParams;
  const rawPage = typeof params.page === 'string' ? parseInt(params.page, 10) : NaN;
  // Invalid/missing page numbers default to 1
  const requestedPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  let adSlots: AdSlot[] = [];
  let pagination: PaginationMeta | null = null;
  let fetchError: string | null = null;

  try {
    const requestHeaders = await headers();
    const res = await fetch(
      `${API_URL}/api/ad-slots?page=${requestedPage}&limit=${PAGE_SIZE}`,
      {
        cache: 'no-store',
        headers: { cookie: requestHeaders.get('cookie') ?? '' },
      }
    );
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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-4">
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-[var(--color-muted)]">Browse available ad slots from our publishers</p>
      </div>

      {fetchError ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">{fetchError}</div>
      ) : (
        <>
          {pagination && pagination.total > 0 && (
            <p className="text-sm text-[var(--color-muted)]">
              Showing {(currentPage - 1) * pagination.limit + 1}–{Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} results
            </p>
          )}
          <AdSlotGrid adSlots={adSlots} />
          {totalPages > 1 && (
            <Suspense fallback={null}>
              <PaginationControls currentPage={currentPage} totalPages={totalPages} total={pagination?.total ?? 0} limit={pagination?.limit ?? PAGE_SIZE} />
            </Suspense>
          )}
        </>
      )}
    </div>
  );
}
