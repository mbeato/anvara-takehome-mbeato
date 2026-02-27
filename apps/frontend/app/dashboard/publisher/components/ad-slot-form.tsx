'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createAdSlot, updateAdSlot } from '../actions';
import type { ActionState } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
import { trackAdSlotCreateAttempt, trackAdSlotCreate } from '@/lib/analytics';
import { Modal } from '@/app/components/modal';
import type { AdSlot } from '@/lib/types';

interface AdSlotFormProps {
  adSlot?: AdSlot;
  onClose?: () => void;
}

export function AdSlotForm({ adSlot, onClose }: AdSlotFormProps) {
  const action = adSlot ? updateAdSlot : createAdSlot;
  const initialState: ActionState = {};
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    if (!adSlot) {
      trackAdSlotCreateAttempt();
    }
    formAction(formData);
  };

  useEffect(() => {
    if (state.success) {
      if (!adSlot) {
        trackAdSlotCreate('new');
      }
      onClose?.();
    }
  }, [state.success, onClose, adSlot]);

  const inputClass =
    'mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 min-h-[44px]';

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {adSlot && <input type="hidden" name="id" value={adSlot.id} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input id="name" name="name" defaultValue={adSlot?.name ?? ''} className={inputClass} />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium">
          Type
        </label>
        <select id="type" name="type" defaultValue={adSlot?.type ?? ''} className={inputClass}>
          <option value="">Select type...</option>
          <option value="DISPLAY">Display</option>
          <option value="VIDEO">Video</option>
          <option value="NATIVE">Native</option>
          <option value="NEWSLETTER">Newsletter</option>
          <option value="PODCAST">Podcast</option>
        </select>
        {state.fieldErrors?.type && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.type}</p>
        )}
      </div>

      <div>
        <label htmlFor="basePrice" className="block text-sm font-medium">
          Base Price ($/mo)
        </label>
        <input
          id="basePrice"
          name="basePrice"
          type="text"
          defaultValue={adSlot?.basePrice ?? ''}
          className={inputClass}
        />
        {state.fieldErrors?.basePrice && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.basePrice}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={adSlot?.description ?? ''}
          rows={3}
          className={inputClass}
        />
      </div>

      {state.error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Ad slot {adSlot ? 'updated' : 'created'} successfully!
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
        <SubmitButton>{adSlot ? 'Update Ad Slot' : 'Create Ad Slot'}</SubmitButton>
      </div>
    </form>
  );
}

export function CreateAdSlotButton() {
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
        New Ad Slot
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="New Ad Slot" size="md">
        <AdSlotForm onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
