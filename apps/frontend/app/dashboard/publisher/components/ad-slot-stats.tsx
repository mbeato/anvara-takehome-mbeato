import { StatCard } from '@/app/components/stat-card';
import type { AdSlotStats } from '@/lib/types';

interface AdSlotStatsRowProps {
  stats: AdSlotStats;
}

export function AdSlotStatsRow({ stats }: AdSlotStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Total Ad Slots" value={stats.totalSlots} />
      <StatCard label="Active" value={stats.activeSlots} />
      <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
      <StatCard label="Avg Price" value={formatCurrency(stats.avgPrice)} />
    </div>
  );
}

function formatCurrency(value: string): string {
  const num = Number(value);
  if (num === 0) return '$0';
  if (num >= 1000) return `$${Math.round(num).toLocaleString()}`;
  return `$${num.toFixed(2)}`;
}
