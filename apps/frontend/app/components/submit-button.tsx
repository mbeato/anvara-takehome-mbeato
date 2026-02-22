'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
      {...props}
    >
      {pending ? 'Saving...' : children}
    </button>
  );
}
