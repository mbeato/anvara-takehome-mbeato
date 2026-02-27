'use client';

import { useRef, useCallback, type RefObject } from 'react';

interface UseSwipeDismissOptions {
  onDismiss: () => void;
  threshold?: number;
  enabled?: boolean;
}

interface SwipeHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

const NOOP_HANDLERS: SwipeHandlers = {
  onPointerDown: () => {},
  onPointerMove: () => {},
  onPointerUp: () => {},
};

export function useSwipeDismiss(
  contentRef: RefObject<HTMLElement | null>,
  options: UseSwipeDismissOptions
): SwipeHandlers {
  const { onDismiss, threshold = 100, enabled = true } = options;

  const startYRef = useRef(0);
  const trackingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;

      const el = contentRef.current;
      if (!el) return;

      // Only initiate swipe tracking when content is scrolled to top
      if (el.scrollTop > 0) return;

      startYRef.current = e.clientY;
      trackingRef.current = true;
      pointerIdRef.current = e.pointerId;
    },
    [enabled, contentRef]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!trackingRef.current) return;
      if (e.pointerId !== pointerIdRef.current) return;

      const deltaY = e.clientY - startYRef.current;

      // Only process downward swipes
      if (deltaY <= 0) return;

      const el = contentRef.current;
      if (!el) return;

      // Apply visual feedback during drag
      el.style.transform = `translateY(${deltaY}px)`;
      el.style.opacity = `${Math.max(0, 1 - deltaY / 400)}`;
      el.style.transition = 'none';
    },
    [contentRef]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!trackingRef.current) return;
      if (e.pointerId !== pointerIdRef.current) return;

      trackingRef.current = false;
      pointerIdRef.current = null;

      const deltaY = e.clientY - startYRef.current;
      const el = contentRef.current;

      if (deltaY >= threshold) {
        onDismiss();
      }

      // Snap back with transition
      if (el) {
        el.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        el.style.transform = '';
        el.style.opacity = '';
      }
    },
    [threshold, onDismiss, contentRef]
  );

  if (!enabled) return NOOP_HANDLERS;

  return { onPointerDown, onPointerMove, onPointerUp };
}
