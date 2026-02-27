'use client';

import { useActionState, useState } from 'react';
import type { Campaign } from '@/lib/types';
import { deleteCampaign } from '../actions';
import type { ActionState } from '../actions';
import { CampaignForm } from './campaign-form';
import { Modal } from '@/app/components/modal';

interface CampaignCardProps {
  campaign: Campaign;
}

const statusDotColors: Record<string, string> = {
  DRAFT: 'bg-gray-400',
  ACTIVE: 'bg-green-500',
  PAUSED: 'bg-yellow-500',
  COMPLETED: 'bg-blue-500',
  PENDING_REVIEW: 'bg-orange-400',
  APPROVED: 'bg-emerald-400',
  CANCELLED: 'bg-red-500',
};

function formatStatusLabel(status: string): string {
  const lower = status.toLowerCase().replace(/_/g, ' ');
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const initialState: ActionState = {};
  const [deleteState, deleteAction] = useActionState(deleteCampaign, initialState);

  const dotColor = statusDotColors[campaign.status] || 'bg-gray-400';

  return (
    <>
      <div className="flex h-full flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-sm transition-shadow hover:shadow-md">
        {/* Header: title + icon buttons */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[var(--color-foreground)]">{campaign.name}</h3>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditForm(true)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded bg-gray-100 px-3 py-2 text-xs text-[var(--color-muted)] transition-colors hover:bg-gray-200 hover:text-[var(--color-foreground)]"
            >
              Edit
            </button>
            <form
              action={deleteAction}
              onSubmit={(e) => {
                if (!window.confirm('Delete this campaign?')) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={campaign.id} />
              <button
                type="submit"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded bg-red-50 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-100"
              >
                Delete
              </button>
            </form>
          </div>
        </div>

        {/* Description -- 2-line clamp, fixed height for uniform cards */}
        <p className="mt-2 min-h-[2.5rem] text-sm text-[var(--color-muted)] line-clamp-2">
          {campaign.description || '\u00A0'}
        </p>

        {/* Status indicator: colored dot + text */}
        <div className="mt-1 mb-1 flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
          <span className="text-sm text-[var(--color-foreground)]">
            {formatStatusLabel(campaign.status)}
          </span>
        </div>

        {/* Key-value data pairs */}
        <div className="mt-auto space-y-1.5 border-t border-[var(--color-border)] pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-muted)]">Start</span>
            <span className="text-[var(--color-foreground)]">{formatDate(campaign.startDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-muted)]">End</span>
            <span className="text-[var(--color-foreground)]">{formatDate(campaign.endDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-muted)]">Budget</span>
            <span className="font-medium text-[var(--color-foreground)]">
              ${Number(campaign.budget).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Delete error */}
        {deleteState.error && (
          <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
            {deleteState.error}
          </div>
        )}
      </div>

      <Modal
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        title="Edit Campaign"
        size="md"
      >
        <CampaignForm campaign={campaign} onClose={() => setShowEditForm(false)} />
      </Modal>
    </>
  );
}
