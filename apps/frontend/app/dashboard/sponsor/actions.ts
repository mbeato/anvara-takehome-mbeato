'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { API_URL } from '@/lib/config';

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createCampaign(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get('name') as string;
  const budget = formData.get('budget') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const description = formData.get('description') as string;

  const fieldErrors: Record<string, string> = {};
  if (!name?.trim()) fieldErrors.name = 'Name is required';
  if (!budget?.trim()) {
    fieldErrors.budget = 'Budget is required';
  } else if (isNaN(Number(budget)) || Number(budget) <= 0) {
    fieldErrors.budget = 'Budget must be a positive number';
  }
  if (!startDate) fieldErrors.startDate = 'Start date is required';
  if (!endDate) fieldErrors.endDate = 'End date is required';
  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    fieldErrors.endDate = 'End date must be after start date';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') ?? '';

  try {
    const body: Record<string, string> = {
      name: name.trim(),
      budget: budget.trim(),
      startDate,
      endDate,
    };
    if (description?.trim()) {
      body.description = description.trim();
    }

    const res = await fetch(`${API_URL}/api/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.error?.message || 'Failed to create campaign' };
    }

    revalidatePath('/dashboard/sponsor');
    return { success: true };
  } catch {
    return { error: 'Unable to connect to the server' };
  }
}

export async function updateCampaign(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const budget = formData.get('budget') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;

  const fieldErrors: Record<string, string> = {};
  if (!id) fieldErrors.id = 'Missing campaign ID';
  if (!name?.trim()) fieldErrors.name = 'Name is required';
  if (!budget?.trim()) {
    fieldErrors.budget = 'Budget is required';
  } else if (isNaN(Number(budget)) || Number(budget) <= 0) {
    fieldErrors.budget = 'Budget must be a positive number';
  }
  if (!startDate) fieldErrors.startDate = 'Start date is required';
  if (!endDate) fieldErrors.endDate = 'End date is required';
  if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    fieldErrors.endDate = 'End date must be after start date';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') ?? '';

  try {
    const body: Record<string, string> = {
      name: name.trim(),
      budget: budget.trim(),
      startDate,
      endDate,
    };
    if (description?.trim()) {
      body.description = description.trim();
    }
    if (status) {
      body.status = status;
    }

    const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.error?.message || 'Failed to update campaign' };
    }

    revalidatePath('/dashboard/sponsor');
    return { success: true };
  } catch {
    return { error: 'Unable to connect to the server' };
  }
}

export async function deleteCampaign(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get('id') as string;
  if (!id) return { error: 'Missing campaign ID' };

  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') ?? '';

  try {
    const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
      method: 'DELETE',
      headers: { cookie },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.error?.message || 'Failed to delete campaign' };
    }

    revalidatePath('/dashboard/sponsor');
    return { success: true };
  } catch {
    return { error: 'Unable to connect to the server' };
  }
}
