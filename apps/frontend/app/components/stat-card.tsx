interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[--color-muted]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[--color-foreground]">{value}</p>
    </div>
  );
}
