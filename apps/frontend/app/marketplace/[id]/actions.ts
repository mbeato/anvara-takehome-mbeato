'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export type QuoteActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  quoteId?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestQuote(
  prevState: QuoteActionState,
  formData: FormData
): Promise<QuoteActionState> {
  const email = formData.get('email') as string;
  const companyName = formData.get('companyName') as string;
  const budgetRange = formData.get('budgetRange') as string;
  const phone = formData.get('phone') as string;
  const campaignGoals = formData.get('campaignGoals') as string;
  const timeline = formData.get('timeline') as string;
  const specialRequirements = formData.get('specialRequirements') as string;
  const adSlotId = formData.get('adSlotId') as string;

  // Client-side validation
  const fieldErrors: Record<string, string> = {};

  if (!email?.trim()) {
    fieldErrors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    fieldErrors.email = 'Please enter a valid email address';
  }

  if (!companyName?.trim()) {
    fieldErrors.companyName = 'Company name is required';
  }

  if (!budgetRange?.trim()) {
    fieldErrors.budgetRange = 'Please select a budget range';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    const body: Record<string, string | undefined> = {
      email: email.trim(),
      companyName: companyName.trim(),
      budgetRange,
      adSlotId,
      phone: phone?.trim() || undefined,
      campaignGoals: campaignGoals?.trim() || undefined,
      timeline: timeline?.trim() || undefined,
      specialRequirements: specialRequirements?.trim() || undefined,
    };

    const res = await fetch(`${API_URL}/api/quotes/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return {
        error: data?.error?.message || 'Failed to submit quote request',
      };
    }

    const data = await res.json();
    return { success: true, quoteId: data.quoteId };
  } catch {
    return {
      error: 'Unable to connect to the server. Please try again later.',
    };
  }
}
