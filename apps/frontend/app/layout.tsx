import type { Metadata } from 'next';
import './globals.css';
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
  // Missing: openGraph, twitter, icons, viewport, etc.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // HINT: If using React Query, you would wrap children with QueryClientProvider here
  // See: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl flex-grow p-4">{children}</main>
        <footer className="mt-16 border-t border-[--color-border]">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="grid gap-8 md:grid-cols-2">
              <NewsletterForm />
              <div className="text-sm text-[--color-muted]">
                <p className="font-semibold text-[--color-foreground]">Anvara</p>
                <p className="mt-1">
                  Sponsorship marketplace connecting sponsors with publishers.
                </p>
              </div>
            </div>
            <div className="mt-8 border-t border-[--color-border] pt-4 text-center text-xs text-[--color-muted]">
              &copy; {new Date().getFullYear()} Anvara. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
