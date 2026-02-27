'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { authClient } from '@/auth-client';
import { DURATION, EASE } from '@/lib/motion';

type UserRole = 'sponsor' | 'publisher' | null;

export function Nav() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [role, setRole] = useState<UserRole>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(0);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${userId}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data: { role: UserRole }) => {
        if (!cancelled) setRole(data.role);
      })
      .catch(() => {
        if (!cancelled) setRole(null);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Body scroll prevention and data attribute for content push
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.dataset.menuOpen = 'true';
    } else {
      document.body.style.overflow = '';
      delete document.documentElement.dataset.menuOpen;
    }

    return () => {
      document.body.style.overflow = '';
      delete document.documentElement.dataset.menuOpen;
    };
  }, [menuOpen]);

  const effectiveRole = userId ? role : null;

  const navLinks = (
    <>
      {user && (
        <Link
          href="/marketplace"
          className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          onClick={() => setMenuOpen(false)}
        >
          Marketplace
        </Link>
      )}
      {user && effectiveRole === 'sponsor' && (
        <Link
          href="/dashboard/sponsor"
          className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          onClick={() => setMenuOpen(false)}
        >
          My Campaigns
        </Link>
      )}
      {user && effectiveRole === 'publisher' && (
        <Link
          href="/dashboard/publisher"
          className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          onClick={() => setMenuOpen(false)}
        >
          My Ad Slots
        </Link>
      )}
    </>
  );

  const authBlock = isPending ? (
    <span className="text-[var(--color-muted)]">...</span>
  ) : user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm text-[var(--color-muted)]">
        {user.name} {effectiveRole && `(${effectiveRole})`}
      </span>
      <button
        onClick={async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                window.location.href = '/';
              },
            },
          });
        }}
        className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-500"
      >
        Logout
      </button>
    </div>
  ) : isLoginPage ? null : (
    <Link
      href="/login"
      className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-primary-hover)]"
      onClick={() => setMenuOpen(false)}
    >
      Login
    </Link>
  );

  /** Hamburger bar shared styles */
  const barClass = 'block h-[2px] w-5 rounded-full bg-current';

  return (
    <header ref={headerRef} className={`sticky top-0 z-40 border-b ${isLoginPage ? 'border-transparent bg-transparent' : 'border-[var(--color-border)] bg-[var(--color-background)]'}`}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/">
          <Image src="/logo.png" alt="Anvara" width={120} height={21} priority />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks}
          {authBlock}
        </div>

        {/* Mobile: Login always visible; hamburger only when logged in */}
        <div className="flex items-center gap-3 md:hidden">
          {!user && !isPending && !isLoginPage && (
            <Link
              href="/login"
              className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-primary-hover)]"
            >
              Login
            </Link>
          )}
          {user && (
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className="flex w-5 flex-col items-center gap-[5px]">
                <motion.span
                  className={barClass}
                  animate={
                    menuOpen
                      ? { rotate: 45, y: 7 }
                      : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: DURATION.normal, ease: EASE.out }}
                />
                <motion.span
                  className={barClass}
                  animate={
                    menuOpen
                      ? { opacity: 0 }
                      : { opacity: 1 }
                  }
                  transition={{ duration: DURATION.normal, ease: EASE.out }}
                />
                <motion.span
                  className={barClass}
                  animate={
                    menuOpen
                      ? { rotate: -45, y: -7 }
                      : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: DURATION.normal, ease: EASE.out }}
                />
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile slide-out panel — starts below header */}
      <div
        className={`fixed right-0 z-30 flex w-[280px] flex-col border-l border-[var(--color-border)] bg-[var(--color-background)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          menuOpen && user ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: headerH, height: `calc(100% - ${headerH}px)` }}
        aria-hidden={!menuOpen}
      >
        {/* Panel links */}
        <div className="flex flex-1 flex-col gap-1 px-2">
          {user && (
            <Link
              href="/marketplace"
              className="rounded-lg py-3 px-6 text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]"
              onClick={() => setMenuOpen(false)}
            >
              Marketplace
            </Link>
          )}
          {user && effectiveRole === 'sponsor' && (
            <Link
              href="/dashboard/sponsor"
              className="rounded-lg py-3 px-6 text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]"
              onClick={() => setMenuOpen(false)}
            >
              My Campaigns
            </Link>
          )}
          {user && effectiveRole === 'publisher' && (
            <Link
              href="/dashboard/publisher"
              className="rounded-lg py-3 px-6 text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)]"
              onClick={() => setMenuOpen(false)}
            >
              My Ad Slots
            </Link>
          )}
        </div>

        {/* Panel auth block at bottom */}
        {user && (
          <div className="border-t border-[var(--color-border)] p-4">
            <span className="block text-sm text-[var(--color-muted)]">
              {user.name} {effectiveRole && `(${effectiveRole})`}
            </span>
            <button
              onClick={async () => {
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = '/';
                    },
                  },
                });
              }}
              className="mt-3 min-h-[44px] w-full rounded bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-500"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Click-to-close overlay on pushed content area only */}
      {menuOpen && user && (
        <div
          className="pointer-events-auto fixed inset-0 right-[280px] z-30 md:hidden"
          style={{ top: headerH }}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
