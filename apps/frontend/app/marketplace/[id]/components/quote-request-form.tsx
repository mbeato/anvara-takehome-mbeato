'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { requestQuote, type QuoteActionState } from '../actions';
import { SubmitButton } from '@/app/components/submit-button';

interface QuoteRequestFormProps {
  adSlot: {
    id: string;
    name: string;
    basePrice: string;
    publisher?: { name: string };
  };
  user: { name: string; email: string } | null;
  onClose: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name: string, value: string): string {
  switch (name) {
    case 'email':
      if (!value.trim()) return 'Email is required';
      if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
      return '';
    case 'companyName':
      if (!value.trim()) return 'Company name is required';
      return '';
    case 'budgetRange':
      if (!value.trim()) return 'Please select a budget range';
      return '';
    default:
      return '';
  }
}

export function QuoteRequestForm({ adSlot, user, onClose }: QuoteRequestFormProps) {
  const initialState: QuoteActionState = {};
  const [state, formAction] = useActionState(requestQuote, initialState);
  const [blurErrors, setBlurErrors] = useState<Record<string, string>>({});

  // Track submitted values for success summary
  const [submittedCompany, setSubmittedCompany] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState(user?.email || '');
  const [submittedBudget, setSubmittedBudget] = useState('');

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setBlurErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setBlurErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const getError = (name: string): string | undefined => {
    return blurErrors[name] || state.fieldErrors?.[name] || undefined;
  };

  const inputClass =
    'mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900';

  if (state.success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold">Quote Request Submitted</h3>

        <p className="font-mono text-sm text-[var(--color-muted)]">
          Reference: {state.quoteId}
        </p>

        <p className="text-sm text-[var(--color-muted)]">
          We&apos;ll respond within 1-2 business days
        </p>

        <div className="rounded bg-gray-50 p-3 text-sm text-left">
          <div>
            <span className="font-bold">Company:</span> {submittedCompany}
          </div>
          <div>
            <span className="font-bold">Email:</span> {submittedEmail}
          </div>
          <div>
            <span className="font-bold">Budget:</span> {submittedBudget}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Link
            href="/marketplace"
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Browse More Listings
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 rounded bg-gray-50 p-3">
        <p className="font-medium">{adSlot.name}</p>
        <p className="text-sm text-[var(--color-muted)]">
          {adSlot.publisher?.name && `by ${adSlot.publisher.name} · `}
          ${Number(adSlot.basePrice).toLocaleString()}/mo
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="adSlotId" value={adSlot.id} />

        {/* Contact Information */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">
            Contact Information
          </h4>

          <div className="space-y-3">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium">
                Company Name *
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                className={inputClass}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onChange={(e) => setSubmittedCompany(e.target.value)}
              />
              {getError('companyName') && (
                <p className="mt-1 text-sm text-red-600">{getError('companyName')}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email || ''}
                className={inputClass}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onChange={(e) => setSubmittedEmail(e.target.value)}
              />
              {getError('email') && (
                <p className="mt-1 text-sm text-red-600">{getError('email')}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactName" className="block text-sm font-medium">
                Contact Name
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                defaultValue={user?.name || ''}
                className={inputClass}
                onBlur={handleBlur}
                onFocus={handleFocus}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={inputClass}
                onBlur={handleBlur}
                onFocus={handleFocus}
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">
            Project Details
          </h4>

          <div className="space-y-3">
            <div>
              <label htmlFor="budgetRange" className="block text-sm font-medium">
                Budget Range *
              </label>
              <select
                id="budgetRange"
                name="budgetRange"
                className={inputClass}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onChange={(e) => setSubmittedBudget(e.target.value)}
              >
                <option value="">Select budget range...</option>
                <option value="$500-$1k">$500 - $1,000</option>
                <option value="$1k-$5k">$1,000 - $5,000</option>
                <option value="$5k-$10k">$5,000 - $10,000</option>
                <option value="$10k+">$10,000+</option>
              </select>
              {getError('budgetRange') && (
                <p className="mt-1 text-sm text-red-600">{getError('budgetRange')}</p>
              )}
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium">
                Timeline
              </label>
              <select
                id="timeline"
                name="timeline"
                className={inputClass}
                onBlur={handleBlur}
                onFocus={handleFocus}
              >
                <option value="">Select timeline...</option>
                <option value="ASAP">ASAP</option>
                <option value="1-2 weeks">1-2 Weeks</option>
                <option value="1 month">1 Month</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label htmlFor="campaignGoals" className="block text-sm font-medium">
                Campaign Goals
              </label>
              <textarea
                id="campaignGoals"
                name="campaignGoals"
                rows={3}
                placeholder="Describe your campaign goals..."
                className={inputClass}
                onBlur={handleBlur}
                onFocus={handleFocus}
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">
            Additional Information
          </h4>

          <div>
            <label htmlFor="specialRequirements" className="block text-sm font-medium">
              Special Requirements
            </label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              rows={3}
              placeholder="Any special requirements or considerations..."
              className={inputClass}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
          </div>
        </div>

        {state.error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {state.error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <SubmitButton>Submit Quote Request</SubmitButton>
        </div>
      </form>
    </>
  );
}
