import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your Anvara account to manage campaigns or ad slots.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
