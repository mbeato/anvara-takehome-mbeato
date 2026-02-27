'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/modal';
import { QuoteRequestForm } from './quote-request-form';

interface QuoteRequestButtonProps {
  adSlot: {
    id: string;
    name: string;
    basePrice: string;
    publisher?: { name: string };
  };
  user: { name: string; email: string } | null;
}

export function QuoteRequestButton({ adSlot, user }: QuoteRequestButtonProps) {
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  const handleOpen = () => {
    setOpenCount((c) => c + 1);
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full min-h-[44px] rounded-lg border-2 border-[var(--color-primary)] px-4 py-3 font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
      >
        Request a Quote
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Request a Quote"
        size="lg"
      >
        <QuoteRequestForm
          key={openCount}
          adSlot={adSlot}
          user={user}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
