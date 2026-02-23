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
  const typeColor = typeTextColors[adSlot.type] || 'text-[--color-foreground]';

  return (
    <>
      <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-4 shadow-sm transition-shadow hover:shadow-md">
        {/* Header: title + icon buttons */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[--color-foreground]">{adSlot.name}</h3>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setShowEditForm(true)}
              aria-label="Edit ad slot"
              className="rounded p-1.5 text-[--color-muted] transition-colors hover:bg-[--color-border] hover:text-[--color-foreground]"
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
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
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
                aria-label="Delete ad slot"
                className="rounded p-1.5 text-[--color-muted] transition-colors hover:bg-red-50 hover:text-red-600"
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
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Description -- 2-line clamp */}
        {adSlot.description && (
          <p className="mt-2 text-sm text-[--color-muted] line-clamp-2">{adSlot.description}</p>
        )}

        {/* Availability indicator: colored dot + text */}
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${availabilityDot}`} />
          <span className="text-sm text-[--color-foreground]">{availabilityLabel}</span>
        </div>

        {/* Key-value data pairs */}
        <div className="mt-3 space-y-1.5 border-t border-[--color-border] pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[--color-muted]">Type</span>
            <span className={`font-medium ${typeColor}`}>{formatTypeLabel(adSlot.type)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[--color-muted]">Price</span>
            <span className="font-medium text-[--color-foreground]">
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
