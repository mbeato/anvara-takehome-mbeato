interface StatsSectionProps {
  sponsors: number;
  publishers: number;
  activeCampaigns: number;
  totalPlacements: number;
}

const STAT_LABELS: { key: keyof StatsSectionProps; label: string }[] = [
  { key: 'sponsors', label: 'Active Sponsors' },
  { key: 'publishers', label: 'Publishers' },
  { key: 'activeCampaigns', label: 'Active Campaigns' },
  { key: 'totalPlacements', label: 'Total Placements' },
];

export function StatsSection({ sponsors, publishers, activeCampaigns, totalPlacements }: StatsSectionProps) {
  const values: StatsSectionProps = { sponsors, publishers, activeCampaigns, totalPlacements };

  return (
    <section className="w-full bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-16 animate-fade-in-up">
        <h2 className="mb-8 text-center text-3xl font-bold font-[family-name:var(--font-display)]">
          Trusted by the Numbers
        </h2>
        <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {STAT_LABELS.map(({ key, label }) => (
            <div key={key}>
              <p className="text-3xl font-bold font-[family-name:var(--font-display)] text-[var(--color-foreground)]">
                {values[key].toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
