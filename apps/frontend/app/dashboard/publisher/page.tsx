import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import type { AdSlot, AdSlotStats } from '@/lib/types';
import { AdSlotList } from './components/ad-slot-list';
import { AdSlotStatsRow } from './components/ad-slot-stats';
import { CreateAdSlotButton } from './components/ad-slot-form';

export const metadata: Metadata = {
  title: 'My Ad Slots',
  description: 'Manage your advertising inventory, set rates, and track earnings.',
  openGraph: {
    title: 'My Ad Slots | Anvara',
    description: 'Manage your advertising inventory, set rates, and track earnings.',
  },
};

import { API_URL } from '@/lib/config';

async function fetchAdSlotStats(cookie: string): Promise<AdSlotStats | null> {
  try {
    const res = await fetch(`${API_URL}/api/ad-slots/stats`, {
      cache: 'no-store',
      headers: { cookie },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function PublisherDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Verify user has 'publisher' role
  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'publisher') {
    redirect('/');
  }

  // Fetch ad slots and stats in parallel
  let adSlots: AdSlot[] = [];
  let fetchError: string | null = null;
  let stats: AdSlotStats | null = null;

  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') ?? '';

  try {
    const [adSlotsRes, statsResult] = await Promise.all([
      fetch(`${API_URL}/api/ad-slots`, {
        cache: 'no-store',
        headers: { cookie },
      }),
      fetchAdSlotStats(cookie),
    ]);

    if (!adSlotsRes.ok) {
      fetchError = 'Failed to load ad slots';
    } else {
      adSlots = await adSlotsRes.json();
    }

    stats = statsResult;
  } catch {
    fetchError = 'Unable to connect to the server. Please try again later.';
  }

  return (
    <div className="space-y-6 px-6 py-6 md:px-16 lg:px-32">
      {/* Header: title + subtitle + create button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My Ad Slots</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Manage your advertising inventory
          </p>
        </div>
        <CreateAdSlotButton />
      </div>

      {/* KPI Stats Row */}
      {stats && <AdSlotStatsRow stats={stats} />}

      {/* Ad Slot Grid or Error */}
      {fetchError ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">{fetchError}</div>
      ) : (
        <AdSlotList adSlots={adSlots} />
      )}
    </div>
  );
}
