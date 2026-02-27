import { sendGAEvent } from '@next/third-parties/google';

function track(eventName: string, params?: Record<string, string | number>): void {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Analytics]', eventName, params);
    return;
  }

  try {
    sendGAEvent('event', eventName, params ?? {});
  } catch {
    // Silently swallow errors (adblockers, GA not loaded, etc.)
  }
}

export function trackQuoteRequest(adSlotId: string): void {
  track('quote_request', { ad_slot_id: adSlotId });
}

export function trackCampaignCreate(campaignId: string): void {
  track('campaign_create', { campaign_id: campaignId });
}

export function trackAdSlotCreate(adSlotId: string): void {
  track('ad_slot_create', { ad_slot_id: adSlotId });
}

export function trackNewsletterSignup(): void {
  track('newsletter_signup');
}

export function trackMarketplaceClick(adSlotId: string): void {
  track('marketplace_click', { ad_slot_id: adSlotId });
}

export function trackCtaClick(ctaName: string, location: string): void {
  track('cta_click', { cta_name: ctaName, location });
}

export function trackQuoteRequestAttempt(adSlotId: string): void {
  track('quote_request_attempt', { ad_slot_id: adSlotId });
}

export function trackCampaignCreateAttempt(): void {
  track('campaign_create_attempt');
}

export function trackAdSlotCreateAttempt(): void {
  track('ad_slot_create_attempt');
}

export function trackNewsletterSignupAttempt(): void {
  track('newsletter_signup_attempt');
}
