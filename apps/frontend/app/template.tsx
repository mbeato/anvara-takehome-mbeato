'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { EASE } from '@/lib/motion';

/** Extract the top-level route segment from a pathname.
 *  '/'              -> '/'
 *  '/marketplace'   -> '/marketplace'
 *  '/marketplace/3' -> '/marketplace'
 *  '/dashboard/foo' -> '/dashboard'
 *  '/login'         -> '/login'
 */
function topSegment(pathname: string): string {
  if (pathname === '/') return '/';
  const seg = pathname.split('/')[1]; // first non-empty segment
  return `/${seg}`;
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment = topSegment(pathname);
  const prevSegmentRef = useRef(segment);

  // Determine whether this navigation crosses a top-level section boundary.
  const isTopLevelChange = segment !== prevSegmentRef.current;

  // Update ref AFTER reading the comparison value.
  prevSegmentRef.current = segment;

  // Only animate when moving between top-level sections (e.g., / -> /marketplace,
  // /marketplace -> /dashboard). Within-section navigations (e.g.,
  // /marketplace -> /marketplace/[id]) render children directly with no transition.
  if (!isTopLevelChange) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: EASE.out }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
