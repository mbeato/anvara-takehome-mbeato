export function Hero() {
  return (
    <section className="w-full py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="items-center md:grid md:grid-cols-2 md:gap-12">
          {/* Text content */}
          <div className="animate-fade-in-up">
            <h1 className="text-4xl font-bold leading-tight tracking-tight font-[family-name:var(--font-display)] md:text-5xl">
              Grow Your Reach Through Sponsorships
            </h1>
            <p className="mt-4 max-w-lg text-lg text-[var(--color-muted)]">
              Connect with premium publishers and sponsors in one marketplace.
              Transparent pricing, easy management, real results.
            </p>
            <a
              href="/login"
              className="mt-8 inline-block rounded-lg bg-[var(--color-primary)] px-8 py-3 text-lg font-semibold text-white hover:bg-[var(--color-primary-hover)]"
            >
              Start Growing Today
            </a>
          </div>

          {/* Illustration: abstract sponsor-publisher connection */}
          <div className="mt-12 flex items-center justify-center md:mt-0">
            <svg
              viewBox="0 0 400 300"
              className="h-auto w-full max-w-sm"
              aria-hidden="true"
            >
              {/* Connection lines */}
              <line x1="100" y1="80" x2="300" y2="60" stroke="var(--color-primary)" strokeWidth="2" opacity="0.25" />
              <line x1="100" y1="80" x2="300" y2="150" stroke="var(--color-primary)" strokeWidth="2" opacity="0.2" />
              <line x1="100" y1="150" x2="300" y2="60" stroke="var(--color-secondary)" strokeWidth="2" opacity="0.2" />
              <line x1="100" y1="150" x2="300" y2="150" stroke="var(--color-secondary)" strokeWidth="2" opacity="0.25" />
              <line x1="100" y1="150" x2="300" y2="240" stroke="var(--color-secondary)" strokeWidth="2" opacity="0.2" />
              <line x1="100" y1="220" x2="300" y2="150" stroke="var(--color-primary)" strokeWidth="2" opacity="0.2" />
              <line x1="100" y1="220" x2="300" y2="240" stroke="var(--color-primary)" strokeWidth="2" opacity="0.25" />

              {/* Sponsor nodes (left) */}
              <circle cx="100" cy="80" r="24" fill="var(--color-primary)" opacity="0.15" />
              <circle cx="100" cy="80" r="12" fill="var(--color-primary)" opacity="0.6" />
              <circle cx="100" cy="150" r="28" fill="var(--color-primary)" opacity="0.15" />
              <circle cx="100" cy="150" r="14" fill="var(--color-primary)" opacity="0.6" />
              <circle cx="100" cy="220" r="22" fill="var(--color-primary)" opacity="0.15" />
              <circle cx="100" cy="220" r="11" fill="var(--color-primary)" opacity="0.6" />

              {/* Publisher nodes (right) */}
              <circle cx="300" cy="60" r="26" fill="var(--color-secondary)" opacity="0.15" />
              <circle cx="300" cy="60" r="13" fill="var(--color-secondary)" opacity="0.6" />
              <circle cx="300" cy="150" r="30" fill="var(--color-secondary)" opacity="0.15" />
              <circle cx="300" cy="150" r="15" fill="var(--color-secondary)" opacity="0.6" />
              <circle cx="300" cy="240" r="24" fill="var(--color-secondary)" opacity="0.15" />
              <circle cx="300" cy="240" r="12" fill="var(--color-secondary)" opacity="0.6" />

              {/* Labels */}
              <text x="100" y="275" textAnchor="middle" fill="var(--color-muted)" fontSize="13" fontWeight="500">Sponsors</text>
              <text x="300" y="275" textAnchor="middle" fill="var(--color-muted)" fontSize="13" fontWeight="500">Publishers</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
