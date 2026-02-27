/**
 * Shared animation constants for consistent motion across the app.
 * These are plain objects — no runtime dependency on the `motion` library.
 * Components import these and pass them to motion components or CSS transitions.
 */

/** Animation durations in seconds */
export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  page: 0.4,
} as const;

/** Cubic-bezier easing curves */
export const EASE = {
  /** Smooth deceleration — good for entrances */
  out: [0.22, 1, 0.36, 1] as const,
  /** Smooth acceleration — good for exits */
  in: [0.55, 0.06, 0.68, 0.19] as const,
  /** Smooth both directions — good for layout shifts */
  inOut: [0.65, 0, 0.35, 1] as const,
} as const;

/** Stagger delay between sequential child animations (seconds) */
export const STAGGER = {
  fast: 0.08,
  normal: 0.1,
  slow: 0.15,
} as const;

/** Fade in and slide up — most common entrance animation */
export const FADE_IN_UP = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.normal, ease: EASE.out },
} as const;

/** Simple opacity fade — for subtle reveals */
export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: DURATION.normal, ease: EASE.out },
} as const;

/** Scale in from slightly smaller — for modals, tooltips, popovers */
export const SCALE_IN = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: DURATION.fast, ease: EASE.out },
} as const;
