'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useTransition } from 'react';
import { track } from '@/lib/analytics';

interface Props {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  total: _total,
  limit: _limit,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState(String(currentPage));

  // Sync input value when currentPage prop changes (after navigation)
  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const navigateToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(totalPages, page));

      track('pagination_used', {
        funnel_step: 'browse',
        from_page: currentPage,
        to_page: clamped,
      });

      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(clamped));
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [totalPages, searchParams, pathname, router, startTransition, currentPage]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.replace(/\D/g, ''));
  };

  const handleSubmit = () => {
    const parsed = parseInt(inputValue, 10);
    if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      navigateToPage(parsed);
    } else {
      setInputValue(String(currentPage));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleBlur = () => {
    handleSubmit();
  };

  const buttonClass =
    'min-h-[44px] flex items-center px-2 text-sm font-medium text-[var(--color-primary)] hover:underline disabled:opacity-50 disabled:pointer-events-none';

  return (
    <nav
      aria-label="Pagination"
      className={`mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 ${isPending ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3 justify-self-end">
        {currentPage > 1 && (
          <>
            <button
              disabled={isPending}
              onClick={() => navigateToPage(1)}
              className={`${buttonClass} hidden sm:inline-flex`}
            >
              First
            </button>
            <button
              disabled={isPending}
              onClick={() => navigateToPage(currentPage - 1)}
              className={buttonClass}
            >
              Prev
            </button>
          </>
        )}
      </div>
      <span className="flex items-center justify-center gap-2 text-sm text-[var(--color-muted)]">
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isPending}
          className="w-12 min-h-[44px] rounded border border-[var(--color-border)] bg-[var(--color-background)] px-1 py-0.5 text-center text-sm text-[var(--color-foreground)]"
          aria-label="Page number"
        />
        of {totalPages} pages
      </span>
      <div className="flex items-center gap-3 justify-self-start">
        {currentPage < totalPages && (
          <>
            <button
              disabled={isPending}
              onClick={() => navigateToPage(currentPage + 1)}
              className={buttonClass}
            >
              Next
            </button>
            <button
              disabled={isPending}
              onClick={() => navigateToPage(totalPages)}
              className={`${buttonClass} hidden sm:inline-flex`}
            >
              Last
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
