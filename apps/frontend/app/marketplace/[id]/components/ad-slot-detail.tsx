'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getAdSlot } from '@/lib/api';
import { authClient } from '@/auth-client';
import type { AdSlot } from '@/lib/types';
import { QuoteRequestButton } from './quote-request-button';
import { track } from '@/lib/analytics';
import { toGA4Item } from '@/lib/ab-tests';
import { API_URL } from '@/lib/config';
import { useABTest } from '@/app/hooks/use-ab-test';
import { formatCompactNumber } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
}

interface RoleInfo {
  role: 'sponsor' | 'publisher' | null;
  sponsorId?: string;
  publisherId?: string;
  name?: string;
}

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

interface Props {
  id: string;
}

export function AdSlotDetail({ id }: Props) {
  const [adSlot, setAdSlot] = useState<AdSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [relatedSlots, setRelatedSlots] = useState<AdSlot[]>([]);

  const { variant: ctaVariant } = useABTest('cta-copy');

  // --- Conversion tracking refs ---
  const viewTracked = useRef(false);
  const checkoutTracked = useRef(false);

  useEffect(() => {
    // Fetch ad slot
    getAdSlot(id)
      .then(setAdSlot)
      .catch(() => setError('Failed to load ad slot details'))
      .finally(() => setLoading(false));

    // Check user session and fetch role
    authClient
      .getSession()
      .then(({ data }) => {
        if (data?.user) {
          const sessionUser = data.user as User;
          setUser(sessionUser);

          // Fetch role info from backend
          fetch(`${API_URL}/api/auth/role/${sessionUser.id}`, { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => setRoleInfo(data))
            .catch(() => setRoleInfo(null))
            .finally(() => setRoleLoading(false));
        } else {
          setRoleLoading(false);
        }
      })
      .catch(() => setRoleLoading(false));
  }, [id]);

  // Track view_item once both data and auth loading resolve (TRCK-02)
  useEffect(() => {
    if (!loading && !roleLoading && adSlot && !viewTracked.current) {
      viewTracked.current = true;
      track('view_item', {
        funnel_step: 'view',
        currency: 'USD',
        value: Number(adSlot.basePrice),
        items: [toGA4Item(adSlot)],
        user_type: roleInfo?.role || (user ? 'authenticated' : 'anonymous'),
      });
    }
  }, [loading, roleLoading, adSlot, roleInfo, user]);

  // Fetch related listings from same publisher (CONV-10)
  useEffect(() => {
    if (!adSlot?.publisherId) return;

    fetch(`${API_URL}/api/ad-slots`, { credentials: 'include' })
      .then((res) => res.json())
      .then((slots: AdSlot[]) => {
        const related = slots
          .filter((s) => s.publisherId === adSlot.publisherId && s.id !== adSlot.id)
          .sort((a, b) => (a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1))
          .slice(0, 3);
        setRelatedSlots(related);
      })
      .catch(() => {});
  }, [adSlot]);

  // Fire begin_checkout on first booking interaction (TRCK-03)
  const handleBeginCheckout = useCallback(
    (checkoutType: 'booking' | 'quote') => {
      if (checkoutTracked.current || !adSlot) return;
      checkoutTracked.current = true;
      track('begin_checkout', {
        funnel_step: 'engage',
        currency: 'USD',
        value: Number(adSlot.basePrice),
        items: [toGA4Item(adSlot)],
        checkout_type: checkoutType,
        user_type: roleInfo?.role || (user ? 'authenticated' : 'anonymous'),
      });
    },
    [adSlot, roleInfo, user]
  );

  const handleBooking = async () => {
    if (!roleInfo?.sponsorId || !adSlot) return;

    setBooking(true);
    setBookingError(null);

    try {
      const response = await fetch(`${API_URL}/api/ad-slots/${adSlot.id}/book`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book placement');
      }

      setBookingSuccess(true);

      // Track successful booking (TRCK-04)
      track('purchase', {
        funnel_step: 'convert',
        transaction_id: adSlot.id,
        currency: 'USD',
        value: Number(adSlot.basePrice),
        items: [toGA4Item(adSlot)],
        user_type: roleInfo?.role || (user ? 'authenticated' : 'anonymous'),
      });

      setAdSlot({ ...adSlot, isAvailable: false });
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book placement');
    } finally {
      setBooking(false);
    }
  };

  const handleUnbook = async () => {
    if (!adSlot) return;

    try {
      const response = await fetch(`${API_URL}/api/ad-slots/${adSlot.id}/unbook`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to reset booking');
      }

      setBookingSuccess(false);
      setAdSlot({ ...adSlot, isAvailable: true });
      setMessage('');
    } catch (_err) {
      // Silently handle unbook failure - UI state remains unchanged
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-[var(--color-muted)]">Loading...</div>;
  }

  if (error || !adSlot) {
    return (
      <div className="space-y-4">
        <Link
          href="/marketplace"
          className="inline-flex items-center min-h-[44px] text-[var(--color-primary)] hover:underline"
        >
          ← Back to Marketplace
        </Link>
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {error || 'Ad slot not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/marketplace"
        className="inline-flex items-center min-h-[44px] text-[var(--color-primary)] hover:underline"
      >
        ← Back to Marketplace
      </Link>

      <div className="rounded-lg border border-[var(--color-border)] p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{adSlot.name}</h1>
            {adSlot.publisher && (
              <p className="text-[var(--color-muted)]">
                by {adSlot.publisher.name}
                {adSlot.publisher.website && (
                  <>
                    {' '}
                    ·{' '}
                    <a
                      href={adSlot.publisher.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-[var(--color-primary)] hover:underline"
                    >
                      {adSlot.publisher.website}
                    </a>
                  </>
                )}
              </p>
            )}
          </div>
          <span className={`rounded px-3 py-1 text-sm ${typeColors[adSlot.type] || 'bg-gray-100'}`}>
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && (
          <p className="mb-6 text-[var(--color-muted)]">{adSlot.description}</p>
        )}

        {/* Publisher Info Section (CONV-05) */}
        {adSlot.publisher && (
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              About the Publisher
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium">{adSlot.publisher.name}</span>
              {adSlot.publisher.isVerified && (
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  Verified Publisher
                </span>
              )}
              {adSlot.publisher.category && (
                <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                  {adSlot.publisher.category}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--color-muted)]">
              {adSlot.publisher.monthlyViews != null && adSlot.publisher.monthlyViews > 0 && (
                <span>{formatCompactNumber(adSlot.publisher.monthlyViews)} monthly views</span>
              )}
              {adSlot.publisher.subscriberCount != null && adSlot.publisher.subscriberCount > 0 && (
                <span>{formatCompactNumber(adSlot.publisher.subscriberCount)} subscribers</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
          <div>
            <span
              className={`text-sm font-medium ${adSlot.isAvailable ? 'text-green-600' : 'text-[var(--color-muted)]'}`}
            >
              {adSlot.isAvailable ? '● Available' : '○ Currently Booked'}
            </span>
            {!adSlot.isAvailable && !bookingSuccess && (
              <button
                onClick={handleUnbook}
                className="ml-3 text-sm text-[var(--color-primary)] underline hover:opacity-80"
              >
                Reset listing
              </button>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--color-primary)]">
              ${Number(adSlot.basePrice).toLocaleString()}
            </p>
            <p className="text-sm text-[var(--color-muted)]">per month</p>
          </div>
        </div>

        {adSlot.isAvailable && !bookingSuccess && (
          <>
            <div className="mt-6 border-t border-[var(--color-border)] pt-6">
              <h2 className="mb-4 text-lg font-semibold">Request This Placement</h2>

              {roleLoading ? (
                <div className="py-4 text-center text-[var(--color-muted)]">Loading...</div>
              ) : roleInfo?.role === 'sponsor' && roleInfo?.sponsorId ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[var(--color-muted)]">
                      Your Company
                    </label>
                    <p className="text-[var(--color-foreground)]">{roleInfo.name || user?.name}</p>
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1 block text-sm font-medium text-[var(--color-muted)]"
                    >
                      Message to Publisher (optional)
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onFocus={() => handleBeginCheckout('booking')}
                      placeholder="Tell the publisher about your campaign goals..."
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 min-h-[44px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                      rows={3}
                    />
                  </div>
                  {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
                  <button
                    onClick={() => {
                      handleBeginCheckout('booking');
                      handleBooking();
                    }}
                    disabled={booking}
                    className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  >
                    {booking
                      ? 'Booking...'
                      : ctaVariant === 'B' && adSlot.publisher?.monthlyViews
                        ? `Reach ${formatCompactNumber(adSlot.publisher.monthlyViews)} Monthly Readers`
                        : 'Book This Placement'}
                  </button>
                  {adSlot.publisher && (
                    <p className="text-center text-sm text-[var(--color-muted)]">
                      Secure your spot on {adSlot.publisher.name}&apos;s{' '}
                      {adSlot.publisher.category ? `${adSlot.publisher.category} ` : ''}audience
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-3 font-semibold text-gray-500"
                  >
                    Request This Placement
                  </button>
                  <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
                    {user
                      ? 'Only sponsors can request placements'
                      : 'Log in as a sponsor to request this placement'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <QuoteRequestButton
                adSlot={{
                  id: adSlot.id,
                  name: adSlot.name,
                  basePrice: String(adSlot.basePrice),
                  publisher: adSlot.publisher ? { name: adSlot.publisher.name } : undefined,
                }}
                user={user}
                onBeginCheckout={() => handleBeginCheckout('quote')}
              />
              <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
                Get custom pricing for this placement
              </p>
            </div>
          </>
        )}

        {bookingSuccess && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-green-800">Placement Booked!</h3>
            <p className="mt-1 text-sm text-green-700">
              Your request has been submitted. The publisher will be in touch soon.
            </p>
            <button
              onClick={handleUnbook}
              className="mt-3 text-sm text-green-700 underline hover:text-green-800"
            >
              Remove Booking (reset for testing)
            </button>
          </div>
        )}
      </div>

      {/* Related Listings (CONV-10) */}
      {relatedSlots.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] p-6">
          <h2 className="mb-4 text-lg font-semibold">
            More from {adSlot.publisher?.name ?? 'this Publisher'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedSlots.map((related) => (
              <Link
                key={related.id}
                href={`/marketplace/${related.id}`}
                className="rounded-lg border border-[var(--color-border)] p-3 transition-shadow hover:shadow-md"
              >
                <h3 className="font-medium">{related.name}</h3>
                <p className="text-lg font-bold text-[var(--color-primary)]">
                  ${Number(related.basePrice).toLocaleString()}/mo
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {related.isAvailable ? (
                    <span className="text-green-600">Available</span>
                  ) : (
                    <span>Currently Booked</span>
                  )}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
