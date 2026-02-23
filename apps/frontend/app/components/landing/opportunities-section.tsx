'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ListingCard } from './listing-card';
import type { FeaturedListing, FeaturedListingsPagination } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';
const SCROLL_SPEED = 0.5; // pixels per frame

interface OpportunitiesSectionProps {
  initialListings: FeaturedListing[];
  initialPagination: FeaturedListingsPagination;
}

export function OpportunitiesSection({
  initialListings,
  initialPagination,
}: OpportunitiesSectionProps) {
  const [listings, setListings] = useState(initialListings);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const rafRef = useRef<number>(0);

  const loadMore = useCallback(async () => {
    if (loading || !pagination.hasMore) return;
    setLoading(true);

    try {
      const nextOffset = pagination.offset + pagination.limit;
      const res = await fetch(
        `${API_URL}/api/ad-slots/featured?limit=${pagination.limit}&offset=${nextOffset}`,
      );
      if (res.ok) {
        const json = await res.json();
        setListings((prev) => [...prev, ...json.data]);
        setPagination(json.pagination);
      }
    } catch {
      // Silently fail — user can scroll again to retry
    } finally {
      setLoading(false);
    }
  }, [loading, pagination]);

  // Observe the sentinel at the right edge of the scroll track
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const track = trackRef.current;
    if (!sentinel || !track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { root: track, rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Smooth continuous auto-scroll — pause on hover / touch
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let pos = track.scrollLeft;

    const tick = () => {
      if (!pausedRef.current) {
        const max = track.scrollWidth - track.clientWidth;
        if (pos < max) {
          pos += SCROLL_SPEED;
          track.scrollLeft = pos;
        }
      } else {
        // Sync accumulator if user scrolled manually
        pos = track.scrollLeft;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const pause = () => { pausedRef.current = true; };
    const resume = () => { pausedRef.current = false; };

    track.addEventListener('mouseenter', pause);
    track.addEventListener('mouseleave', resume);
    track.addEventListener('touchstart', pause, { passive: true });
    track.addEventListener('touchend', resume);

    return () => {
      cancelAnimationFrame(rafRef.current);
      track.removeEventListener('mouseenter', pause);
      track.removeEventListener('mouseleave', resume);
      track.removeEventListener('touchstart', pause);
      track.removeEventListener('touchend', resume);
    };
  }, []);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold font-[family-name:var(--font-display)]">
          Sponsorship Opportunities
        </h2>

        {/* Scrollable track */}
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="min-w-[280px] max-w-[340px] flex-shrink-0 sm:min-w-[300px]"
            >
              <ListingCard
                name={listing.name}
                type={listing.type}
                basePrice={listing.basePrice}
                publisherName={listing.publisher.name}
              />
            </div>
          ))}

          {/* Sentinel for loading more */}
          <div ref={sentinelRef} className="w-1 flex-shrink-0" />

          {loading && (
            <div className="flex w-16 flex-shrink-0 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
            </div>
          )}
        </div>

        {!pagination.hasMore && (
          <p className="mt-4 text-center text-[var(--color-muted)]">
            <a
              href="/login"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Sign in to browse all opportunities
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
