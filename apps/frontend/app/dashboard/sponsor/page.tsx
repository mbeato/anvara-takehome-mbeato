import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import type { Campaign, CampaignStats } from '@/lib/types';
import { CampaignList } from './components/campaign-list';
import { CampaignStatsRow } from './components/campaign-stats';
import { CreateCampaignButton } from './components/campaign-form';

export const metadata: Metadata = {
  title: 'My Campaigns',
  description:
    'Manage your sponsorship campaigns, track budgets, and monitor performance.',
  openGraph: {
    title: 'My Campaigns | Anvara',
    description: 'Manage your sponsorship campaigns, track budgets, and monitor performance.',
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

async function fetchCampaignStats(cookie: string): Promise<CampaignStats | null> {
  try {
    const res = await fetch(`${API_URL}/api/campaigns/stats`, {
      cache: 'no-store',
      headers: { cookie },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

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

  // Fetch campaigns and stats in parallel
  let campaigns: Campaign[] = [];
  let fetchError: string | null = null;
  let stats: CampaignStats | null = null;

  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') ?? '';

  if (roleData.sponsorId) {
    try {
      const [campaignsRes, statsResult] = await Promise.all([
        fetch(`${API_URL}/api/campaigns`, {
          cache: 'no-store',
          headers: { cookie },
        }),
        fetchCampaignStats(cookie),
      ]);

      if (!campaignsRes.ok) {
        fetchError = 'Failed to load campaigns';
      } else {
        campaigns = await campaignsRes.json();
      }

      stats = statsResult;
    } catch {
      fetchError = 'Unable to connect to the server. Please try again later.';
    }
  }

  return (
    <div className="space-y-6 px-6 py-6 md:px-16 lg:px-32">
      {/* Header: title + subtitle + create button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My Campaigns</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Manage your sponsorship campaigns
          </p>
        </div>
        <CreateCampaignButton />
      </div>

      {/* KPI Stats Row */}
      {stats && <CampaignStatsRow stats={stats} />}

      {/* Campaign Grid or Error */}
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
