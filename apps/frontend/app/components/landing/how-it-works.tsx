const SPONSOR_STEPS = [
  { title: 'Search the Marketplace', description: 'Browse ad slots from publishers across categories, formats, and price points.' },
  { title: 'Choose Your Slots', description: 'Select the ad slots that align with your audience and budget.' },
  { title: 'Launch Your Campaign', description: 'Set your budget, upload creatives, and start reaching new audiences.' },
];

const PUBLISHER_STEPS = [
  { title: 'List Your Inventory', description: 'Add your available ad slots with descriptions, formats, and placement details.' },
  { title: 'Set Your Rates', description: 'Price your inventory based on your audience size and engagement.' },
  { title: 'Start Earning', description: 'Receive campaign placements and grow your revenue from sponsorships.' },
];

export function HowItWorks() {
  return (
    <section className="w-full bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-16 animate-fade-in-up">
        <h2 className="mb-12 text-center text-3xl font-bold font-[family-name:var(--font-display)]">
          How It Works
        </h2>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Sponsor track */}
          <div>
            <h3 className="mb-6 text-xl font-semibold text-[var(--color-primary)] font-[family-name:var(--font-display)]">
              For Sponsors
            </h3>
            <ol className="space-y-6">
              {SPONSOR_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--color-foreground)]">{step.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Publisher track */}
          <div>
            <h3 className="mb-6 text-xl font-semibold text-[var(--color-secondary)] font-[family-name:var(--font-display)]">
              For Publishers
            </h3>
            <ol className="space-y-6">
              {PUBLISHER_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--color-foreground)]">{step.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
