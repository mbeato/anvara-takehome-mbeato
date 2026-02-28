import { headers as nextHeaders } from 'next/headers';
import { API_URL } from '@/lib/config';

export type UserRole = 'sponsor' | 'publisher' | null;

export interface RoleData {
  role: UserRole;
  sponsorId?: string;
  publisherId?: string;
  name?: string;
}

/**
 * Fetch user role from the backend based on userId.
 * Returns role info including sponsorId/publisherId if applicable.
 * Forwards session cookies for server-side auth.
 */
export async function getUserRole(userId: string): Promise<RoleData> {
  try {
    const requestHeaders = await nextHeaders();
    const res = await fetch(`${API_URL}/api/auth/role/${userId}`, {
      cache: 'no-store',
      headers: { cookie: requestHeaders.get('cookie') ?? '' },
    });
    if (!res.ok) {
      return { role: null };
    }
    return await res.json();
  } catch {
    return { role: null };
  }
}
