'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createCampaign, updateCampaign } from '../actions';
import type { ActionState } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import { trackCampaignCreateAttempt, trackCampaignCreate } from '@/lib/analytics';
import { Modal } from '@/app/components/modal';
import type { Campaign } from '@/lib/types';

interface CampaignFormProps {
  campaign?: Campaign;
  onClose?: () => void;
}

export function CampaignForm({ campaign, onClose }: CampaignFormProps) {
  const action = campaign ? updateCampaign : createCampaign;
  const initialState: ActionState = {};
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    if (!campaign) {
      trackCampaignCreateAttempt();
    }
    formAction(formData);
  };

  useEffect(() => {
    if (state.success) {
      if (!campaign) {
        trackCampaignCreate('new');
      }
      onClose?.();
    }
  }, [state.success, onClose, campaign]);

  const inputClass =
    'mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 min-h-[44px]';

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {campaign && <input type="hidden" name="id" value={campaign.id} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input id="name" name="name" defaultValue={campaign?.name ?? ''} className={inputClass} />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium">
          Budget
        </label>
        <input
          id="budget"
          name="budget"
          type="text"
          defaultValue={campaign?.budget ?? ''}
          className={inputClass}
        />
        {state.fieldErrors?.budget && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.budget}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium">
            Start Date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={campaign?.startDate ? campaign.startDate.split('T')[0] : ''}
            className={inputClass}
          />
          {state.fieldErrors?.startDate && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.startDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium">
            End Date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={campaign?.endDate ? campaign.endDate.split('T')[0] : ''}
            className={inputClass}
          />
          {state.fieldErrors?.endDate && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.endDate}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={campaign?.description ?? ''}
          rows={3}
          className={inputClass}
        />
      </div>

      {campaign && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium">
            Status
          </label>
          <select id="status" name="status" defaultValue={campaign.status} className={inputClass}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      )}

      {state.error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Campaign {campaign ? 'updated' : 'created'} successfully!
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm min-h-[44px] hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <SubmitButton>{campaign ? 'Update Campaign' : 'Create Campaign'}</SubmitButton>
      </div>
    </form>
  );
}

export function CreateCampaignButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New Campaign
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="New Campaign" size="md">
        <CampaignForm onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
