interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}
