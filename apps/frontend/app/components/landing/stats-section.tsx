'use client';

import { motion } from 'motion/react';
import { FADE_IN_UP, STAGGER, DURATION, EASE } from '@/lib/motion';

interface StatsSectionProps {
  sponsors: number;
  publishers: number;
  activeCampaigns: number;
  totalPlacements: number;
}

const STAT_LABELS: { key: keyof StatsSectionProps; label: string }[] = [
  { key: 'sponsors', label: 'Active Sponsors' },
  { key: 'publishers', label: 'Publishers' },
  { key: 'activeCampaigns', label: 'Active Campaigns' },
  { key: 'totalPlacements', label: 'Total Placements' },
];

export function StatsSection({
  sponsors,
  publishers,
  activeCampaigns,
  totalPlacements,
}: StatsSectionProps) {
  const values: StatsSectionProps = { sponsors, publishers, activeCampaigns, totalPlacements };

  return (
    <section className="w-full bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <motion.h2
          className="mb-8 text-center text-3xl font-bold font-[family-name:var(--font-display)]"
          initial={FADE_IN_UP.initial}
          whileInView={FADE_IN_UP.animate}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: DURATION.normal, ease: EASE.out }}
        >
          Trusted by the Numbers
        </motion.h2>
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {STAT_LABELS.map(({ key, label }, i) => (
            <motion.div
              key={key}
              initial={FADE_IN_UP.initial}
              whileInView={FADE_IN_UP.animate}
              viewport={{ once: true }}
              transition={{
                duration: DURATION.normal,
                ease: EASE.out,
                delay: i * STAGGER.normal,
              }}
            >
              <p className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-foreground)]">
                {values[key].toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
