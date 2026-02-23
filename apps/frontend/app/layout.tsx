import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { inter, plusJakartaSans } from './fonts';
import { Nav } from './components/nav';
import { NewsletterForm } from './components/newsletter-form';

// TODO: Add ErrorBoundary wrapper for graceful error handling
// TODO: Consider adding a loading.tsx for Suspense boundaries
// TODO: Add Open Graph metadata for social media sharing
// TODO: Add Twitter Card metadata
// TODO: Consider adding favicon and app icons

export const metadata: Metadata = {
  title: 'Anvara Marketplace',
  description: 'Sponsorship marketplace connecting sponsors with publishers',
  icons: { icon: '/favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // HINT: If using React Query, you would wrap children with QueryClientProvider here
  // See: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased font-[family-name:var(--font-inter)]">
        <Nav />
        <main className="flex-grow">{children}</main>
        <footer className="mt-16 border-t border-[var(--color-border)]">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <NewsletterForm />
              <div className="flex flex-shrink-0 flex-col items-start md:items-end md:text-right">
                <p className="font-semibold text-[var(--color-foreground)]">Ready to grow your reach?</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Connect with publishers and sponsors.
                </p>
                <a
                  href="/login"
                  className="mt-3 inline-block rounded border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:opacity-90"
                >
                  Get Started
                </a>
              </div>
            </div>
            <div className="mt-8 border-t border-[var(--color-border)] pt-4 text-center text-xs text-[var(--color-muted)]">
              &copy; {new Date().getFullYear()} Anvara. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
