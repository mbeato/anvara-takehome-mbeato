'use client';

import { ListingCard } from './listing-card';

interface FeaturedListing {
  id: string;
  name: string;
  type: string;
  basePrice: string;
  publisher: { name: string };
}

interface FeaturedListingsProps {
  listings: FeaturedListing[];
}

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold font-[family-name:var(--font-display)]">
          Featured Opportunities
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {listings.map((listing, i) => (
            <div
              key={listing.id}
              className={`animate-fade-in-up animation-delay-${(i + 1) * 100}`}
            >
              <ListingCard
                name={listing.name}
                type={listing.type}
                basePrice={listing.basePrice}
                publisherName={listing.publisher.name}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
