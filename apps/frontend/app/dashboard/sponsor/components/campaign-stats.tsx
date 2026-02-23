'use client';

import { motion } from 'motion/react';
import { FADE_IN_UP, STAGGER, DURATION, EASE } from '@/lib/motion';
import { StatCard } from '@/app/components/stat-card';
import type { CampaignStats } from '@/lib/types';

interface CampaignStatsRowProps {
  stats: CampaignStats;
}

const STATS_CONFIG = [
  { label: 'Total Campaigns', key: 'totalCampaigns' },
  { label: 'Active', key: 'activeCampaigns' },
  { label: 'Total Budget', key: 'totalBudget', currency: true },
  { label: 'Avg Budget', key: 'avgBudget', currency: true },
] as const;

export function CampaignStatsRow({ stats }: CampaignStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STATS_CONFIG.map((cfg, i) => (
        <motion.div
          key={cfg.key}
          initial={FADE_IN_UP.initial}
          animate={FADE_IN_UP.animate}
          transition={{
            duration: DURATION.normal,
            ease: EASE.out,
            delay: i * STAGGER.fast,
          }}
        >
          <StatCard
            label={cfg.label}
            value={'currency' in cfg ? formatCurrency(stats[cfg.key] as string) : stats[cfg.key]}
          />
        </motion.div>
      ))}
    </div>
  );
}

function formatCurrency(value: string): string {
  const num = Number(value);
  if (num === 0) return '$0';
  if (num >= 1000) return `$${Math.round(num).toLocaleString()}`;
  return `$${num.toFixed(2)}`;
}
