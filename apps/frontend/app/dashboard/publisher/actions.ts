'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createAdSlot(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const basePrice = formData.get('basePrice') as string;
  const description = formData.get('description') as string;

  const fieldErrors: Record<string, string> = {};
  if (!name?.trim()) fieldErrors.name = 'Name is required';
  if (!type) fieldErrors.type = 'Type is required';
  if (!basePrice?.trim()) fieldErrors.basePrice = 'Base price is required';

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') ?? '';

  try {
    const body: Record<string, string> = {
      name: name.trim(),
      type,
      basePrice: basePrice.trim(),
    };
    if (description?.trim()) {
      body.description = description.trim();
    }

    const res = await fetch(`${API_URL}/api/ad-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.error?.message || 'Failed to create ad slot' };
    }

    revalidatePath('/dashboard/publisher');
    return { success: true };
  } catch {
    return { error: 'Unable to connect to the server' };
  }
}

export async function updateAdSlot(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const basePrice = formData.get('basePrice') as string;
  const description = formData.get('description') as string;

  const fieldErrors: Record<string, string> = {};
  if (!id) fieldErrors.id = 'Missing ad slot ID';
  if (!name?.trim()) fieldErrors.name = 'Name is required';
  if (!type) fieldErrors.type = 'Type is required';
  if (!basePrice?.trim()) fieldErrors.basePrice = 'Base price is required';

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') ?? '';

  try {
    const body: Record<string, string> = {
      name: name.trim(),
      type,
      basePrice: basePrice.trim(),
    };
    if (description?.trim()) {
      body.description = description.trim();
    }

    const res = await fetch(`${API_URL}/api/ad-slots/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.error?.message || 'Failed to update ad slot' };
    }

    revalidatePath('/dashboard/publisher');
    return { success: true };
  } catch {
    return { error: 'Unable to connect to the server' };
  }
}

export async function deleteAdSlot(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get('id') as string;
  if (!id) return { error: 'Missing ad slot ID' };

  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie') ?? '';

  try {
    const res = await fetch(`${API_URL}/api/ad-slots/${id}`, {
      method: 'DELETE',
      headers: { cookie },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.error?.message || 'Failed to delete ad slot' };
    }

    revalidatePath('/dashboard/publisher');
    return { success: true };
  } catch {
    return { error: 'Unable to connect to the server' };
  }
}
