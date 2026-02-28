'use client';

import { usePathname } from 'next/navigation';
import { NewsletterForm } from './newsletter-form';

const HIDDEN_PATHS = ['/login'];

export function Footer() {
  const pathname = usePathname();

  if (HIDDEN_PATHS.includes(pathname)) return null;

  return (
    <footer className="mt-auto border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <NewsletterForm />
          <div className="grid grid-cols-3 gap-6 sm:flex sm:gap-12">
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-foreground)]">Company</h4>
              <ul className="mt-3 space-y-0 text-sm">
                <li>
                  <a
                    href="#"
                    className="block py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-foreground)]">Legal</h4>
              <ul className="mt-3 space-y-0 text-sm">
                <li>
                  <a
                    href="#"
                    className="block py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--color-foreground)]">Support</h4>
              <ul className="mt-3 space-y-0 text-sm">
                <li>
                  <a
                    href="#"
                    className="block py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block py-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-4 text-center text-xs text-[var(--color-muted)]">
          &copy; {new Date().getFullYear()} Anvara. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
