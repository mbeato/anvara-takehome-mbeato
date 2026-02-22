'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createAdSlot, updateAdSlot } from '../actions';
import type { ActionState } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';
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

  useEffect(() => {
    if (state.success) {
      onClose?.();
    }
  }, [state.success, onClose]);

  const inputClass = 'mt-1 w-full rounded border border-[--color-border] px-3 py-2 text-sm';

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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
            className="rounded-lg border border-[--color-border] px-4 py-2 text-sm hover:bg-gray-50"
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
        className="rounded-lg bg-[--color-primary] px-4 py-2 font-semibold text-white hover:opacity-90"
      >
        Create Ad Slot
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 text-gray-900 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Create Ad Slot</h2>
            <AdSlotForm onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
