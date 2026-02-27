'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { useSwipeDismiss } from '@/app/hooks/use-swipe-dismiss';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, size = 'md', children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // SSR-safe mobile detection
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const swipeHandlers = useSwipeDismiss(contentRef, {
    onDismiss: onClose,
    enabled: isMobile,
  });

  const closeIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <dialog
      ref={dialogRef}
      className={`modal-dialog mx-auto my-auto w-full ${sizeClasses[size]} rounded-lg border-0 bg-transparent p-0 shadow-xl`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div
        ref={contentRef}
        className={
          isMobile
            ? 'flex h-full flex-col overflow-y-auto bg-[var(--color-background)] p-6 pt-0'
            : 'rounded-lg bg-[var(--color-background)] p-6'
        }
        {...swipeHandlers}
        style={isMobile ? { touchAction: 'pan-x' } : undefined}
      >
        {isMobile ? (
          <>
            {/* Drag indicator pill */}
            <div className="flex justify-center pb-3 pt-2">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {/* Floating X close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur transition-colors"
            >
              {closeIcon}
            </button>

            {/* Title */}
            <h2 className="mb-4 text-lg font-semibold text-[var(--color-foreground)]">{title}</h2>

            {children}
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-border)] transition-colors"
              >
                {closeIcon}
              </button>
            </div>
            {children}
          </>
        )}
      </div>
    </dialog>
  );
}
