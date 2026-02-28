import { sendGAEvent } from '@next/third-parties/google';
import { getActiveVariants } from '@/lib/ab-tests';

function getUserType(): string {
  if (typeof document === 'undefined') return 'anonymous';
  const hasSession = document.cookie.includes('better-auth.session_token');
  return hasSession ? 'authenticated' : 'anonymous';
}

export function track(eventName: string, params?: Record<string, unknown>): void {
  const activeVariants = getActiveVariants();
  const enrichedParams: Record<string, unknown> = {
    ...activeVariants,
    user_type: getUserType(),
    ...params,
  };

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.group(`%c[Analytics] ${eventName}`, 'color: #6366f1; font-weight: bold');
    // eslint-disable-next-line no-console
    console.log('Params:', enrichedParams);
    if (enrichedParams.funnel_step) {
      // eslint-disable-next-line no-console
      console.log(`Funnel: ${enrichedParams.funnel_step}`);
    }
    if (Object.keys(activeVariants).length > 0) {
      // eslint-disable-next-line no-console
      console.log('Active A/B variants:', activeVariants);
    }
    // eslint-disable-next-line no-console
    console.groupEnd();
    return;
  }

  try {
    sendGAEvent('event', eventName, enrichedParams);
  } catch {
    // Silently swallow errors (adblockers, GA not loaded, etc.)
  }
}

export function trackABExposure(experimentName: string, variant: string): void {
  track('ab_test_exposure', {
    experiment_name: experimentName,
    variant,
    funnel_step: 'browse',
  });
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
