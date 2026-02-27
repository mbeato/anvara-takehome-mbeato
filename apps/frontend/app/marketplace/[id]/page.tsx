import type { Metadata } from 'next';
import { AdSlotDetail } from './components/ad-slot-detail';

export const metadata: Metadata = {
  title: 'Ad Slot Details',
  description: 'View ad slot details, pricing, and availability.',
  openGraph: {
    title: 'Ad Slot Details | Anvara',
    description: 'View ad slot details, pricing, and availability.',
  },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdSlotPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-6 py-4">
      <AdSlotDetail id={id} />
    </div>
  );
}
