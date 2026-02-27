'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

export function useTrackView(
  eventName: string,
  params?: Record<string, unknown>
): void {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    track(eventName, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
