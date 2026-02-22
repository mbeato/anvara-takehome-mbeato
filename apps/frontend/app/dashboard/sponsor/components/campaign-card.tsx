'use client';

import { useActionState, useState } from 'react';
import type { Campaign } from '@/lib/types';
import { deleteCampaign } from '../actions';
import type { ActionState } from '../actions';
import { CampaignForm } from './campaign-form';
import { SubmitButton } from '@/app/components/submit-button';

interface CampaignCardProps {
  campaign: Campaign;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const initialState: ActionState = {};
  const [deleteState, deleteAction] = useActionState(deleteCampaign, initialState);

  const budgetNum = Number(campaign.budget);
  const spentNum = Number(campaign.spent);
  const progress = budgetNum > 0 ? (spentNum / budgetNum) * 100 : 0;

  return (
    <>
      <div className="rounded-lg border border-[--color-border] p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-semibold">{campaign.name}</h3>
          <span
            className={`rounded px-2 py-0.5 text-xs ${statusColors[campaign.status] || 'bg-gray-100'}`}
          >
            {campaign.status}
          </span>
        </div>

        {campaign.description && (
          <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{campaign.description}</p>
        )}

        <div className="mb-2">
          <div className="flex justify-between text-sm">
            <span className="text-[--color-muted]">Budget</span>
            <span>
              ${Number(campaign.spent).toLocaleString()} / $
              {Number(campaign.budget).toLocaleString()}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-[--color-primary]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-[--color-muted]">
          {new Date(campaign.startDate).toLocaleDateString()} -{' '}
          {new Date(campaign.endDate).toLocaleDateString()}
        </div>

        {deleteState.error && (
          <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
            {deleteState.error}
          </div>
        )}

        <div className="mt-3 flex justify-end gap-2 border-t border-[--color-border] pt-3">
          <button
            type="button"
            onClick={() => setShowEditForm(true)}
            className="text-sm text-[--color-primary] hover:opacity-80"
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
            <SubmitButton className="rounded-lg bg-transparent px-3 py-1 text-sm font-normal text-red-600 hover:text-red-700 hover:opacity-100 disabled:opacity-50">
              Delete
            </SubmitButton>
          </form>
        </div>
      </div>

      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Edit Campaign</h2>
            <CampaignForm campaign={campaign} onClose={() => setShowEditForm(false)} />
          </div>
        </div>
      )}
    </>
  );
}
