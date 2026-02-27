'use client';

import { useEffect, useRef, useState } from 'react';
import { EXPERIMENTS, getCookie } from '@/lib/ab-tests';
import { trackABExposure } from '@/lib/analytics';

interface ABTestResult {
  variant: string | null;
  isLoading: boolean;
  experimentName: string;
}

export function useABTest(experimentName: string): ABTestResult {
  const [variant, setVariant] = useState<string | null>(null);
  const exposureTracked = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlOverride = urlParams.get(`ab_${experimentName}`);
    const sessionOverride = sessionStorage.getItem(`ab_override_${experimentName}`);

    if (urlOverride) {
      sessionStorage.setItem(`ab_override_${experimentName}`, urlOverride);
      setVariant(urlOverride);
      return;
    }

    if (sessionOverride) {
      setVariant(sessionOverride);
      return;
    }

    const cookieValue = getCookie(`ab_${experimentName}`);
    if (cookieValue) {
      setVariant(cookieValue);
      return;
    }

    const isRegistered = EXPERIMENTS.some((exp) => exp.name === experimentName);
    if (!isRegistered && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        `[A/B] Experiment "${experimentName}" is not registered in EXPERIMENTS. Defaulting to "A".`
      );
    }

    setVariant('A');
  }, [experimentName]);

  useEffect(() => {
    if (variant && !exposureTracked.current) {
      exposureTracked.current = true;
      trackABExposure(experimentName, variant);
    }
  }, [variant, experimentName]);

  return {
    variant,
    isLoading: variant === null,
    experimentName,
  };
}
