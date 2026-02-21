'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authClient } from '@/auth-client';

type UserRole = 'sponsor' | 'publisher' | null;

export function Nav() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [role, setRole] = useState<UserRole>(null);

  // TODO: Convert to server component and fetch role server-side
  // Fetch user role from backend when user is logged in
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      // No user - no need to fetch role; reset will happen on next render
      // via the initializer or when session changes
      return;
    }

    let cancelled = false;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${userId}`
    )
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

  // Derive effective role: if no user, role is always null
  const effectiveRole = userId ? role : null;

  // TODO: Add active link styling using usePathname() from next/navigation
  // The current page's link should be highlighted differently

  return (
    <header className="border-b border-[--color-border]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold text-[--color-primary]">
          Anvara
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/marketplace"
            className="text-[--color-muted] hover:text-[--color-foreground]"
          >
            Marketplace
          </Link>

          {user && effectiveRole === 'sponsor' && (
            <Link
              href="/dashboard/sponsor"
              className="text-[--color-muted] hover:text-[--color-foreground]"
            >
              My Campaigns
            </Link>
          )}
          {user && effectiveRole === 'publisher' && (
            <Link
              href="/dashboard/publisher"
              className="text-[--color-muted] hover:text-[--color-foreground]"
            >
              My Ad Slots
            </Link>
          )}

          {isPending ? (
            <span className="text-[--color-muted]">...</span>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[--color-muted]">
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
          ) : (
            <Link
              href="/login"
              className="rounded bg-[--color-primary] px-4 py-2 text-sm text-white hover:bg-[--color-primary-hover]"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
