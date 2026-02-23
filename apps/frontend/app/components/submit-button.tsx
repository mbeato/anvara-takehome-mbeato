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
      className="rounded-lg bg-[var(--color-primary)] px-4 py-2 font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      {...props}
    >
      {pending ? 'Saving...' : children}
    </button>
  );
}
