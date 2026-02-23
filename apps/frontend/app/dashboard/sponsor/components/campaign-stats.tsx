import { StatCard } from '@/app/components/stat-card';
import type { CampaignStats } from '@/lib/types';

interface CampaignStatsRowProps {
  stats: CampaignStats;
}

export function CampaignStatsRow({ stats }: CampaignStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Total Campaigns" value={stats.totalCampaigns} />
      <StatCard label="Active" value={stats.activeCampaigns} />
      <StatCard label="Total Budget" value={formatCurrency(stats.totalBudget)} />
      <StatCard label="Avg Budget" value={formatCurrency(stats.avgBudget)} />
    </div>
  );
}

function formatCurrency(value: string): string {
  const num = Number(value);
  if (num === 0) return '$0';
  if (num >= 1000) return `$${Math.round(num).toLocaleString()}`;
  return `$${num.toFixed(2)}`;
}
