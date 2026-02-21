import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import type { AdSlot } from '@/lib/types';
import { AdSlotList } from './components/ad-slot-list';
import { CreateAdSlotButton } from './components/ad-slot-form';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

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

  // Fetch ad slots server-side
  let adSlots: AdSlot[] = [];
  let fetchError: string | null = null;

  try {
    const requestHeaders = await headers();
    const res = await fetch(`${API_URL}/api/ad-slots`, {
      cache: 'no-store',
      headers: { cookie: requestHeaders.get('cookie') ?? '' },
    });
    if (!res.ok) {
      fetchError = 'Failed to load ad slots';
    } else {
      adSlots = await res.json();
    }
  } catch {
    fetchError = 'Unable to connect to the server. Please try again later.';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Ad Slots</h1>
        <CreateAdSlotButton />
      </div>

      {fetchError ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {fetchError}
        </div>
      ) : (
        <AdSlotList adSlots={adSlots} />
      )}
    </div>
  );
}
