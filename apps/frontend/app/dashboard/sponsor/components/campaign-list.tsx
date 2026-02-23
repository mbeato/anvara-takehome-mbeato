'use client';

import { motion } from 'motion/react';
import { FADE_IN_UP, STAGGER, DURATION, EASE } from '@/lib/motion';
import type { Campaign } from '@/lib/types';
import { EmptyState } from '@/app/components/empty-state';
import { CampaignCard } from './campaign-card';
import { CreateCampaignButton } from './campaign-form';

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <EmptyState
        heading="No campaigns yet"
        description="Create your first campaign to start reaching your target audience through premium publishers."
        action={<CreateCampaignButton />}
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign, i) => (
        <motion.div
          key={campaign.id}
          initial={FADE_IN_UP.initial}
          animate={FADE_IN_UP.animate}
          transition={{
            duration: DURATION.normal,
            ease: EASE.out,
            delay: i * STAGGER.fast,
          }}
        >
          <CampaignCard campaign={campaign} />
        </motion.div>
      ))}
    </div>
  );
}
