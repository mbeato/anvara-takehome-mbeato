'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createCampaign, updateCampaign } from '../actions';
import type { ActionState } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
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

  useEffect(() => {
    if (state.success) {
      onClose?.();
    }
  }, [state.success, onClose]);

  const inputClass =
    'mt-1 w-full rounded border border-[--color-border] px-3 py-2 text-sm';

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {campaign && <input type="hidden" name="id" value={campaign.id} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={campaign?.name ?? ''}
          className={inputClass}
        />
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
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.budget}
          </p>
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
            defaultValue={
              campaign?.startDate ? campaign.startDate.split('T')[0] : ''
            }
            className={inputClass}
          />
          {state.fieldErrors?.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.startDate}
            </p>
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
            defaultValue={
              campaign?.endDate ? campaign.endDate.split('T')[0] : ''
            }
            className={inputClass}
          />
          {state.fieldErrors?.endDate && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.endDate}
            </p>
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
          <select
            id="status"
            name="status"
            defaultValue={campaign.status}
            className={inputClass}
          >
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
            className="rounded-lg border border-[--color-border] px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <SubmitButton>
          {campaign ? 'Update Campaign' : 'Create Campaign'}
        </SubmitButton>
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
        className="rounded-lg bg-[--color-primary] px-4 py-2 font-semibold text-white hover:opacity-90"
      >
        Create Campaign
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Create Campaign</h2>
            <CampaignForm onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
