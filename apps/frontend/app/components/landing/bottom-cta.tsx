export function BottomCta() {
  return (
    <section className="w-full bg-[var(--color-primary)] animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-white">
        <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] md:text-4xl">
          Ready to Grow Your Reach?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg opacity-90">
          Join sponsors and publishers who are already growing through Anvara.
          Get started in minutes.
        </p>
        <a
          href="/login"
          className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-[var(--color-primary)] hover:bg-gray-100"
        >
          Get Started Free
        </a>
      </div>
    </section>
  );
}
