import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { inter, plusJakartaSans } from './fonts';
import { Nav } from './components/nav';
import { Footer } from './components/footer';

// TODO: Add ErrorBoundary wrapper for graceful error handling
// TODO: Consider adding a loading.tsx for Suspense boundaries
// TODO: Add Open Graph metadata for social media sharing
// TODO: Add Twitter Card metadata
// TODO: Consider adding favicon and app icons

export const metadata: Metadata = {
  title: {
    default: 'Anvara — Sponsorship Marketplace',
    template: '%s | Anvara',
  },
  description: 'Sponsorship marketplace connecting sponsors with publishers',
  icons: { icon: '/favicon.png' },
  openGraph: {
    siteName: 'Anvara',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // HINT: If using React Query, you would wrap children with QueryClientProvider here
  // See: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased font-[family-name:var(--font-inter)]">
        <Nav />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
