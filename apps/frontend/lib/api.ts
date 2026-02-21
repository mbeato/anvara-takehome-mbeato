import type {
  Campaign,
  CreateCampaignRequest,
  AdSlot,
  CreateAdSlotRequest,
  Placement,
  CreatePlacementRequest,
  DashboardStats,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message || 'API request failed';
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Campaigns
export const getCampaigns = (sponsorId?: string) =>
  api<Campaign[]>(sponsorId ? `/api/campaigns?sponsorId=${sponsorId}` : '/api/campaigns');
export const getCampaign = (id: string) => api<Campaign>(`/api/campaigns/${id}`);
export const createCampaign = (data: CreateCampaignRequest) =>
  api<Campaign>('/api/campaigns', { method: 'POST', body: JSON.stringify(data) });
export const updateCampaign = (id: string, data: Partial<Campaign>) =>
  api<Campaign>(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCampaign = (id: string) =>
  api<void>(`/api/campaigns/${id}`, { method: 'DELETE' });

// Ad Slots
export const getAdSlots = (publisherId?: string) =>
  api<AdSlot[]>(publisherId ? `/api/ad-slots?publisherId=${publisherId}` : '/api/ad-slots');
export const getAdSlot = (id: string) => api<AdSlot>(`/api/ad-slots/${id}`);
export const createAdSlot = (data: CreateAdSlotRequest) =>
  api<AdSlot>('/api/ad-slots', { method: 'POST', body: JSON.stringify(data) });
// TODO: Add updateAdSlot, deleteAdSlot functions

// Placements
export const getPlacements = () => api<Placement[]>('/api/placements');
export const createPlacement = (data: CreatePlacementRequest) =>
  api<Placement>('/api/placements', { method: 'POST', body: JSON.stringify(data) });

// Dashboard
export const getStats = () => api<DashboardStats>('/api/dashboard/stats');
