'use client';

import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'duplicate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [subscribedEmails] = useState(() => new Set<string>());
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-reset after success
  useEffect(() => {
    if (status !== 'success') return;

    const timeout = setTimeout(() => {
      setStatus('idle');
      setErrorMessage('');
      formRef.current?.reset();
      inputRef.current?.focus();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string)?.trim() ?? '';

    // Client-side validation
    if (!EMAIL_REGEX.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    const normalizedEmail = email.toLowerCase();

    // Duplicate prevention within session
    if (subscribedEmails.has(normalizedEmail)) {
      setStatus('duplicate');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          data?.error?.message || 'Something went wrong. Please try again.';
        setStatus('error');
        setErrorMessage(message);
        return;
      }

      subscribedEmails.add(normalizedEmail);
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Unable to connect. Please try again later.');
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-[--color-foreground]">
        Stay in the Loop
      </h3>
      <p className="mt-1 text-sm text-[--color-muted]">
        Get the latest on new ad slots, publisher partnerships, and marketplace
        updates.
      </p>
      <form ref={formRef} onSubmit={handleSubmit} className="mt-4">
        <div className="flex gap-2">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            ref={inputRef}
            id="newsletter-email"
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            aria-describedby="newsletter-feedback"
            aria-invalid={status === 'error'}
            disabled={status === 'submitting'}
            className="flex-1 rounded border border-[--color-border] bg-[--color-background] px-3 py-2 text-sm text-[--color-foreground] placeholder:text-[--color-muted] focus:outline-none focus:ring-2 focus:ring-[--color-primary] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="rounded bg-[--color-primary] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        <div id="newsletter-feedback" role="alert" className="mt-2 text-sm">
          {status === 'error' && (
            <p className="text-red-600">{errorMessage}</p>
          )}
          {status === 'duplicate' && (
            <p className="text-blue-600">You&apos;re already subscribed!</p>
          )}
          {status === 'success' && (
            <p className="text-green-600">
              You&apos;re in! We&apos;ll keep you posted.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
