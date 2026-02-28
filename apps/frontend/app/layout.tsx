import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { inter, plusJakartaSans } from './fonts';
import { Nav } from './components/nav';
import { Footer } from './components/footer';
import { MotionProvider } from './components/motion-provider';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3847';

export const metadata: Metadata = {
  title: {
    default: 'Anvara — Sponsorship Marketplace',
    template: '%s | Anvara',
  },
  description:
    'Anvara connects sponsors with premium publishers. Browse ad slots, request quotes, and launch campaigns — all in one marketplace.',
  metadataBase: new URL(siteUrl),
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    siteName: 'Anvara',
    type: 'website',
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Connect with premium publishers and launch sponsorship campaigns in minutes.',
    url: siteUrl,
    images: [{ url: '/logo.png', width: 120, height: 21, alt: 'Anvara' }],
  },
  twitter: {
    card: 'summary',
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Connect with premium publishers and launch sponsorship campaigns in minutes.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // HINT: If using React Query, you would wrap children with QueryClientProvider here
  // See: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased font-[family-name:var(--font-inter)]">
        <MotionProvider>
          <Nav />
          <div className="flex flex-1 flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] [[data-menu-open='true']_&]:-translate-x-[280px]">
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
          </div>
        </MotionProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
