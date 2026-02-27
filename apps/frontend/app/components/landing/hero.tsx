'use client';

import { motion } from 'motion/react';
import { DURATION, EASE } from '@/lib/motion';
import { trackCtaClick } from '@/lib/analytics';

/*
  Illustration concept: an asymmetric arrangement of mini "UI cards"
  representing ad slots / campaigns, connected by organic curved paths
  that show the marketplace matching sponsors to publishers.
  Mixed shapes, varied sizes, no mirrored symmetry.
*/

export function Hero() {
  return (
    <section className="w-full py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="items-center md:grid md:grid-cols-2 md:gap-12">
          {/* Text content — choreographed 4-step entrance */}
          <div>
            <motion.h1
              className="text-4xl font-bold leading-tight tracking-tight font-[family-name:var(--font-display)] md:text-5xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.normal, ease: EASE.out, delay: 0 }}
            >
              Grow Your Reach Through Sponsorships
            </motion.h1>
            <motion.p
              className="mt-4 max-w-lg text-lg text-[var(--color-muted)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.normal, ease: EASE.out, delay: 0.25 }}
            >
              Connect with premium publishers and sponsors in one marketplace.
              Transparent pricing, easy management, real results.
            </motion.p>
            <motion.a
              href="/login"
              onClick={() => trackCtaClick('get_started', 'hero')}
              className="mt-8 inline-block rounded-lg bg-[var(--color-primary)] px-8 py-3 text-lg font-semibold text-white hover:bg-[var(--color-primary-hover)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.normal, ease: EASE.out, delay: 0.75 }}
            >
              Get Started
            </motion.a>
          </div>

          {/* Illustration — step 3 of entrance choreography */}
          <motion.div
            className="mt-12 flex items-center justify-center md:mt-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.normal, ease: EASE.out, delay: 0.5 }}
          >
            <svg
              viewBox="0 0 420 320"
              className="h-auto w-full max-w-md"
              aria-hidden="true"
            >
              <defs>
                <filter id="softShadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.06" />
                </filter>
                <linearGradient id="path1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.35" />
                </linearGradient>
                <linearGradient id="path2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="path3" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* ---- Curved connection paths ---- */}
              <motion.path
                d="M 108 68 C 180 50, 240 100, 295 118"
                fill="none" stroke="url(#path1)" strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 0.6, ease: EASE.out }}
              />
              <motion.path
                d="M 125 148 C 190 130, 230 170, 282 195"
                fill="none" stroke="url(#path2)" strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.8, ease: EASE.out }}
              />
              <motion.path
                d="M 95 230 C 160 210, 250 250, 310 248"
                fill="none" stroke="url(#path3)" strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.3, delay: 1.0, ease: EASE.out }}
              />
              {/* Cross-connections (sparser — not every-to-every) */}
              <motion.path
                d="M 108 68 C 170 110, 240 180, 282 195"
                fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.15"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1.1, ease: EASE.out }}
              />
              <motion.path
                d="M 125 148 C 200 190, 260 230, 310 248"
                fill="none" stroke="var(--color-secondary)" strokeWidth="1" opacity="0.12"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1.2, ease: EASE.out }}
              />

              {/* ---- Travelling dots (only 2 — restraint) ---- */}
              <motion.circle
                r="3.5"
                fill="var(--color-primary)"
                opacity="0.6"
                animate={{ offsetDistance: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 1.8 }}
                style={{ offsetPath: "path('M 108 68 C 180 50, 240 100, 295 118')" }}
              />
              <motion.circle
                r="3"
                fill="var(--color-secondary)"
                opacity="0.5"
                animate={{ offsetDistance: ['0%', '100%'] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 2.4 }}
                style={{ offsetPath: "path('M 95 230 C 160 210, 250 250, 310 248')" }}
              />

              {/* ============================================= */}
              {/*  LEFT SIDE — Sponsor "cards"                   */}
              {/* ============================================= */}

              {/* Card 1: large — campaign brief */}
              <motion.g
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE.out }}
                filter="url(#softShadow)"
              >
                <rect x="42" y="36" width="110" height="64" rx="8" fill="white" />
                <rect x="42" y="36" width="110" height="64" rx="8" fill="var(--color-primary)" opacity="0.04" />
                {/* Tiny bar chart inside */}
                <rect x="54" y="68" width="8" height="18" rx="2" fill="var(--color-primary)" opacity="0.6" />
                <rect x="66" y="60" width="8" height="26" rx="2" fill="var(--color-primary)" opacity="0.4" />
                <rect x="78" y="64" width="8" height="22" rx="2" fill="var(--color-primary)" opacity="0.55" />
                <rect x="90" y="56" width="8" height="30" rx="2" fill="var(--color-primary)" opacity="0.35" />
                {/* Header line */}
                <rect x="54" y="46" width="44" height="4" rx="2" fill="var(--color-primary)" opacity="0.2" />
                <rect x="104" y="46" width="18" height="4" rx="2" fill="var(--color-primary)" opacity="0.12" />
                {/* Accent corner */}
                <rect x="42" y="36" width="110" height="3" rx="8" fill="var(--color-primary)" opacity="0.5" />
              </motion.g>

              {/* Card 2: medium — budget widget */}
              <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: EASE.out }}
                filter="url(#softShadow)"
              >
                <rect x="58" y="120" width="92" height="56" rx="8" fill="white" />
                <rect x="58" y="120" width="92" height="56" rx="8" fill="var(--color-primary)" opacity="0.03" />
                {/* Circle progress ring */}
                <circle cx="90" cy="148" r="14" fill="none" stroke="var(--color-primary)" strokeWidth="3" opacity="0.12" />
                <motion.circle
                  cx="90" cy="148" r="14"
                  fill="none" stroke="var(--color-primary)" strokeWidth="3" opacity="0.5"
                  strokeDasharray="88" strokeDashoffset="30" strokeLinecap="round"
                  initial={{ strokeDashoffset: 88 }}
                  animate={{ strokeDashoffset: 30 }}
                  transition={{ duration: 1.2, delay: 1.5, ease: EASE.out }}
                />
                {/* Text lines */}
                <rect x="112" y="140" width="28" height="4" rx="2" fill="var(--color-primary)" opacity="0.25" />
                <rect x="112" y="150" width="20" height="3" rx="1.5" fill="var(--color-primary)" opacity="0.12" />
                <rect x="58" y="120" width="92" height="2.5" rx="8" fill="var(--color-primary)" opacity="0.4" />
              </motion.g>

              {/* Card 3: small — tag/label shape */}
              <motion.g
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: EASE.out }}
                filter="url(#softShadow)"
              >
                <rect x="30" y="200" width="105" height="52" rx="8" fill="white" />
                <rect x="30" y="200" width="105" height="52" rx="8" fill="var(--color-primary)" opacity="0.03" />
                {/* Mini line chart */}
                <polyline
                  points="44,234 56,226 68,230 80,220 92,224 104,216 116,222"
                  fill="none" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" strokeLinecap="round" strokeLinejoin="round"
                />
                {/* Header */}
                <rect x="44" y="210" width="36" height="3.5" rx="1.5" fill="var(--color-primary)" opacity="0.2" />
                <rect x="30" y="200" width="105" height="2.5" rx="8" fill="var(--color-primary)" opacity="0.35" />
              </motion.g>

              {/* ============================================= */}
              {/*  RIGHT SIDE — Publisher "slots"                */}
              {/* ============================================= */}

              {/* Slot 1: display ad preview */}
              <motion.g
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: EASE.out }}
                filter="url(#softShadow)"
              >
                <rect x="268" y="88" width="118" height="68" rx="8" fill="white" />
                <rect x="268" y="88" width="118" height="68" rx="8" fill="var(--color-secondary)" opacity="0.04" />
                {/* Image placeholder */}
                <rect x="278" y="100" width="42" height="34" rx="4" fill="var(--color-secondary)" opacity="0.1" />
                <circle cx="292" cy="112" r="6" fill="var(--color-secondary)" opacity="0.18" />
                <polygon points="282,126 296,114 310,126" fill="var(--color-secondary)" opacity="0.12" />
                {/* Text lines */}
                <rect x="328" y="104" width="46" height="4" rx="2" fill="var(--color-secondary)" opacity="0.2" />
                <rect x="328" y="114" width="34" height="3" rx="1.5" fill="var(--color-secondary)" opacity="0.12" />
                <rect x="328" y="124" width="40" height="3" rx="1.5" fill="var(--color-secondary)" opacity="0.12" />
                {/* Price badge */}
                <rect x="278" y="140" width="36" height="10" rx="5" fill="var(--color-secondary)" opacity="0.12" />
                <rect x="282" y="143" width="22" height="4" rx="2" fill="var(--color-secondary)" opacity="0.25" />
                {/* Accent */}
                <rect x="268" y="88" width="118" height="3" rx="8" fill="var(--color-secondary)" opacity="0.45" />
              </motion.g>

              {/* Slot 2: newsletter slot */}
              <motion.g
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: EASE.out }}
                filter="url(#softShadow)"
              >
                <rect x="255" y="176" width="100" height="50" rx="8" fill="white" />
                <rect x="255" y="176" width="100" height="50" rx="8" fill="var(--color-secondary)" opacity="0.03" />
                {/* Horizontal stacked bars — audience breakdown */}
                <rect x="267" y="194" width="60" height="6" rx="3" fill="var(--color-secondary)" opacity="0.08" />
                <motion.rect
                  x="267" y="194" width="42" height="6" rx="3"
                  fill="var(--color-secondary)" opacity="0.35"
                  initial={{ width: 0 }}
                  animate={{ width: 42 }}
                  transition={{ duration: 0.8, delay: 1.6, ease: EASE.out }}
                />
                <rect x="267" y="206" width="60" height="6" rx="3" fill="var(--color-secondary)" opacity="0.08" />
                <motion.rect
                  x="267" y="206" width="34" height="6" rx="3"
                  fill="var(--color-secondary)" opacity="0.25"
                  initial={{ width: 0 }}
                  animate={{ width: 34 }}
                  transition={{ duration: 0.8, delay: 1.8, ease: EASE.out }}
                />
                {/* Header */}
                <rect x="267" y="185" width="30" height="3.5" rx="1.5" fill="var(--color-secondary)" opacity="0.2" />
                {/* Count badge */}
                <rect x="335" y="190" width="12" height="12" rx="6" fill="var(--color-secondary)" opacity="0.12" />
                <rect x="255" y="176" width="100" height="2.5" rx="8" fill="var(--color-secondary)" opacity="0.4" />
              </motion.g>

              {/* Slot 3: podcast slot — wider */}
              <motion.g
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: EASE.out }}
                filter="url(#softShadow)"
              >
                <rect x="280" y="240" width="108" height="46" rx="8" fill="white" />
                <rect x="280" y="240" width="108" height="46" rx="8" fill="var(--color-secondary)" opacity="0.03" />
                {/* Waveform bars */}
                {[0, 8, 16, 24, 32, 40, 48, 56, 64].map((dx, j) => (
                  <motion.rect
                    key={j}
                    x={293 + dx}
                    width="4" rx="2"
                    fill="var(--color-secondary)"
                    opacity={0.2 + (j % 3) * 0.12}
                    initial={{ y: 264, height: 4 }}
                    animate={{ height: [8, 14 + (j % 4) * 5, 8], y: [264, 258 - (j % 4) * 2.5, 264] }}
                    transition={{ duration: 1.6 + j * 0.1, repeat: Infinity, ease: 'easeInOut', delay: 2 + j * 0.08 }}
                  />
                ))}
                {/* Play button */}
                <circle cx="296" cy="254" r="6" fill="var(--color-secondary)" opacity="0.15" />
                <polygon points="294,251 299,254 294,257" fill="var(--color-secondary)" opacity="0.3" />
                <rect x="280" y="240" width="108" height="2.5" rx="8" fill="var(--color-secondary)" opacity="0.35" />
              </motion.g>

              {/* ---- Faint dashed grid in background ---- */}
              <line x1="200" y1="30" x2="200" y2="290" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.05" strokeDasharray="4 6" />
              <line x1="40" y1="160" x2="390" y2="160" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.05" strokeDasharray="4 6" />
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
