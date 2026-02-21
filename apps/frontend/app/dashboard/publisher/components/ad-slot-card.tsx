'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import type { AdSlot } from '@/lib/types';
import { deleteAdSlot } from '../actions';
import type { ActionState } from '../actions';
import { AdSlotForm } from './ad-slot-form';
import { SubmitButton } from '@/app/components/submit-button';

interface AdSlotCardProps {
  adSlot: AdSlot;
}

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

export function AdSlotCard({ adSlot }: AdSlotCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const initialState: ActionState = {};
  const [deleteState, deleteAction] = useFormState(
    deleteAdSlot,
    initialState,
  );

  return (
    <>
      <div className="rounded-lg border border-[--color-border] p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="font-semibold">{adSlot.name}</h3>
          <span className={`rounded px-2 py-0.5 text-xs ${typeColors[adSlot.type] || 'bg-gray-100'}`}>
            {adSlot.type}
          </span>
        </div>

        {adSlot.description && (
          <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{adSlot.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${adSlot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
          >
            {adSlot.isAvailable ? 'Available' : 'Booked'}
          </span>
          <span className="font-semibold text-[--color-primary]">
            ${Number(adSlot.basePrice).toLocaleString()}/mo
          </span>
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
              if (!window.confirm('Delete this ad slot?')) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={adSlot.id} />
            <SubmitButton className="rounded-lg bg-transparent px-3 py-1 text-sm font-normal text-red-600 hover:text-red-700 hover:opacity-100 disabled:opacity-50">
              Delete
            </SubmitButton>
          </form>
        </div>
      </div>

      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Edit Ad Slot</h2>
            <AdSlotForm
              adSlot={adSlot}
              onClose={() => setShowEditForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
