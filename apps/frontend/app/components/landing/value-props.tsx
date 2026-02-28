'use client';

import { motion } from 'motion/react';
import { FADE_IN_UP, STAGGER, DURATION, EASE } from '@/lib/motion';

const VALUE_PROPS = [
  {
    icon: (
      <svg
        className="h-8 w-8 text-[var(--color-primary)]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        />
      </svg>
    ),
    title: 'Targeted Reach',
    description:
      'Connect with publishers in your niche. Browse by category, audience size, and ad format to find the perfect fit.',
  },
  {
    icon: (
      <svg
        className="h-8 w-8 text-[var(--color-primary)]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
        />
      </svg>
    ),
    title: 'Transparent Pricing',
    description:
      'See rates upfront with no hidden fees. Compare pricing across publishers and choose what fits your budget.',
  },
  {
    icon: (
      <svg
        className="h-8 w-8 text-[var(--color-primary)]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
        />
      </svg>
    ),
    title: 'Easy Management',
    description:
      'Track campaigns from one dashboard. Monitor budgets, review placements, and manage everything in one place.',
  },
] as const;

export function ValueProps() {
  return (
    <section className="w-full border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {VALUE_PROPS.map((prop, i) => (
            <motion.div
              key={prop.title}
              className="rounded-lg border border-[var(--color-border)] bg-white p-6"
              initial={FADE_IN_UP.initial}
              whileInView={FADE_IN_UP.animate}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: DURATION.normal,
                ease: EASE.out,
                delay: i * STAGGER.normal,
              }}
            >
              <div className="mb-4">{prop.icon}</div>
              <h3 className="text-lg font-semibold font-[family-name:var(--font-display)]">
                {prop.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{prop.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
