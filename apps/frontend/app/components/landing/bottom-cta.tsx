'use client';

import { motion } from 'motion/react';
import { FADE_IN_UP, DURATION, EASE } from '@/lib/motion';

export function BottomCta() {
  return (
    <motion.section
      className="w-full bg-[var(--color-primary)]"
      initial={FADE_IN_UP.initial}
      whileInView={FADE_IN_UP.animate}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: DURATION.normal, ease: EASE.out }}
    >
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-white">
        <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] md:text-4xl">
          Ready to Grow Your Reach?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg opacity-90">
          Join sponsors and publishers who are already growing through Anvara.
          Get started in minutes.
        </p>
        <a
          href="/login"
          className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-[var(--color-primary)] hover:bg-gray-100"
        >
          Get Started Free
        </a>
      </div>
    </motion.section>
  );
}
