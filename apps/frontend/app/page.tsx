import type { Metadata } from 'next';
import { Hero } from './components/landing/hero';
import { ValueProps } from './components/landing/value-props';
import { HowItWorks } from './components/landing/how-it-works';
import { FeaturedListings } from './components/landing/featured-listings';
import { MoreListings } from './components/landing/more-listings';
import { StatsSection } from './components/landing/stats-section';
import { BottomCta } from './components/landing/bottom-cta';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export const metadata: Metadata = {
  title: 'Anvara — Sponsorship Marketplace for Publishers & Sponsors',
  description:
    'Connect with premium publishers and sponsors. Grow your reach through targeted sponsorships with transparent pricing and easy campaign management.',
  openGraph: {
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Connect with premium publishers and sponsors. Grow your reach through targeted sponsorships.',
    type: 'website',
    siteName: 'Anvara',
  },
};

interface FeaturedListing {
  id: string;
  name: string;
  type: string;
  basePrice: string;
  publisher: { id: string; name: string };
}

interface PlatformStats {
  sponsors: number;
  publishers: number;
  activeCampaigns: number;
  totalPlacements: number;
}

export default async function LandingPage() {
  let listings: FeaturedListing[] = [];
  let stats: PlatformStats | null = null;

  try {
    const [listingsRes, statsRes] = await Promise.all([
      fetch(`${API_URL}/api/ad-slots/featured`, { cache: 'no-store' }),
      fetch(`${API_URL}/api/dashboard/stats`, { cache: 'no-store' }),
    ]);

    if (listingsRes.ok) {
      listings = await listingsRes.json();
    }
    if (statsRes.ok) {
      const statsData = await statsRes.json();
      stats = {
        sponsors: statsData.sponsors,
        publishers: statsData.publishers,
        activeCampaigns: statsData.activeCampaigns,
        totalPlacements: statsData.totalPlacements,
      };
    }
  } catch {
    // Graceful degradation: page renders without data sections
  }

  const featured = listings.slice(0, 3);
  const more = listings.slice(3, 9);

  return (
    <>
      <Hero />
      <ValueProps />
      <HowItWorks />
      {featured.length > 0 && <FeaturedListings listings={featured} />}
      {more.length > 0 && <MoreListings listings={more} />}
      {stats && (
        <StatsSection
          sponsors={stats.sponsors}
          publishers={stats.publishers}
          activeCampaigns={stats.activeCampaigns}
          totalPlacements={stats.totalPlacements}
        />
      )}
      <BottomCta />
    </>
  );
}
