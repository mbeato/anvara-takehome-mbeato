import type { ReactNode } from 'react';

interface EmptyStateProps {
  heading: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ heading, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center">
      <h3 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">
        {heading}
      </h3>
      <p className="mb-4 text-sm text-[var(--color-muted)]">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
