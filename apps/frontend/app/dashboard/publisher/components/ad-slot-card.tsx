'use client';

import { useActionState, useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { deleteAdSlot } from '../actions';
import type { ActionState } from '../actions';
import { AdSlotForm } from './ad-slot-form';
import { Modal } from '@/app/components/modal';

interface AdSlotCardProps {
  adSlot: AdSlot;
}

const typeTextColors: Record<string, string> = {
  DISPLAY: 'text-blue-600',
  VIDEO: 'text-red-600',
  NATIVE: 'text-green-600',
  NEWSLETTER: 'text-purple-600',
  PODCAST: 'text-orange-600',
};

function formatTypeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

export function AdSlotCard({ adSlot }: AdSlotCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const initialState: ActionState = {};
  const [deleteState, deleteAction] = useActionState(deleteAdSlot, initialState);

  const availabilityDot = adSlot.isAvailable ? 'bg-green-500' : 'bg-gray-400';
  const availabilityLabel = adSlot.isAvailable ? 'Available' : 'Booked';
  const typeColor = typeTextColors[adSlot.type] || 'text-[var(--color-foreground)]';

  return (
    <>
      <div className="flex h-full flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-sm transition-shadow hover:shadow-md">
        {/* Header: title + icon buttons */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[var(--color-foreground)]">{adSlot.name}</h3>
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
                if (!window.confirm('Delete this ad slot?')) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={adSlot.id} />
              <button
                type="submit"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded bg-red-50 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-100"
              >
                Delete
              </button>
            </form>
          </div>
        </div>

        {/* Description -- 2-line clamp, fixed height so availability stays consistent */}
        <p className="mt-2 min-h-[2.5rem] text-sm text-[var(--color-muted)] line-clamp-2">
          {adSlot.description || '\u00A0'}
        </p>

        {/* Availability indicator: colored dot + text */}
        <div className="mt-1 mb-1 flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${availabilityDot}`} />
          <span className="text-sm text-[var(--color-foreground)]">{availabilityLabel}</span>
        </div>

        {/* Key-value data pairs */}
        <div className="mt-auto space-y-1.5 border-t border-[var(--color-border)] pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-muted)]">Type</span>
            <span className={`font-medium ${typeColor}`}>{formatTypeLabel(adSlot.type)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-muted)]">Price</span>
            <span className="font-medium text-[var(--color-foreground)]">
              ${Number(adSlot.basePrice).toLocaleString()}/mo
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
        title="Edit Ad Slot"
        size="md"
      >
        <AdSlotForm adSlot={adSlot} onClose={() => setShowEditForm(false)} />
      </Modal>
    </>
  );
}
