'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useTransition } from 'react';

interface Props {
  currentPage: number;
  totalPages: number;
}

export function PaginationControls({ currentPage, totalPages }: Props) {
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
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(clamped));
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [totalPages, searchParams, pathname, router, startTransition]
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
    'text-sm font-medium text-[--color-primary] hover:underline disabled:opacity-50 disabled:pointer-events-none';

  return (
    <nav
      aria-label="Pagination"
      className={`mt-10 flex items-center justify-center gap-3 ${isPending ? 'opacity-50' : ''}`}
    >
      {currentPage > 1 && (
        <>
          <button
            disabled={isPending}
            onClick={() => navigateToPage(1)}
            className={buttonClass}
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
      <span className="flex items-center gap-2 text-sm text-[--color-muted]">
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isPending}
          className="w-12 rounded border border-[--color-border] bg-[--color-background] px-1 py-0.5 text-center text-sm text-[--color-foreground]"
          aria-label="Page number"
        />
        of {totalPages} pages
      </span>
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
            className={buttonClass}
          >
            Last
          </button>
        </>
      )}
    </nav>
  );
}
