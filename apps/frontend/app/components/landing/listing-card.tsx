const TYPE_COLORS: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
  NATIVE: 'bg-green-100 text-green-700',
};

interface ListingCardProps {
  name: string;
  type: string;
  basePrice: string;
  publisherName: string;
}

export function ListingCard({ name, type, basePrice, publisherName }: ListingCardProps) {
  const badgeClass = TYPE_COLORS[type] || 'bg-gray-100 text-gray-700';
  const priceNum = parseFloat(basePrice);
  const formatted = Number.isNaN(priceNum)
    ? basePrice
    : `$${priceNum.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo`;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[var(--color-foreground)]">{name}</h3>
        <span className={`inline-block flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
          {type}
        </span>
      </div>
      <p className="text-lg font-bold text-[var(--color-foreground)]">{formatted}</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{publisherName}</p>
    </div>
  );
}
