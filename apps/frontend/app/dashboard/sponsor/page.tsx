import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import type { Campaign } from '@/lib/types';
import { CampaignList } from './components/campaign-list';
import { CreateCampaignButton } from './components/campaign-form';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export default async function SponsorDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Verify user has 'sponsor' role
  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'sponsor') {
    redirect('/');
  }

  // Fetch campaigns server-side
  let campaigns: Campaign[] = [];
  let fetchError: string | null = null;

  if (roleData.sponsorId) {
    try {
      const requestHeaders = await headers();
      const res = await fetch(
        `${API_URL}/api/campaigns`,
        {
          cache: 'no-store',
          headers: { cookie: requestHeaders.get('cookie') ?? '' },
        },
      );
      if (!res.ok) {
        fetchError = 'Failed to load campaigns';
      } else {
        campaigns = await res.json();
      }
    } catch {
      fetchError = 'Unable to connect to the server. Please try again later.';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        <CreateCampaignButton />
      </div>

      {fetchError ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {fetchError}
        </div>
      ) : (
        <CampaignList campaigns={campaigns} />
      )}
    </div>
  );
}
