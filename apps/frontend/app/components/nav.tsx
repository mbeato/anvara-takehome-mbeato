'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { authClient } from '@/auth-client';

type UserRole = 'sponsor' | 'publisher' | null;

export function Nav() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [role, setRole] = useState<UserRole>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className={`relative z-10 border-b ${isLoginPage ? 'border-transparent bg-transparent' : 'border-[var(--color-border)]'}`}>
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
              className="rounded p-1.5 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu (logged-in only) */}
      {menuOpen && user && (
        <div className="border-t border-[var(--color-border)] px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks}
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
          </div>
        </div>
      )}
    </header>
  );
}
