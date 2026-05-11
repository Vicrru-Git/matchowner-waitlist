export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-white)] px-6 py-24">
      <div className="text-center">
        <p className="font-body text-sm uppercase tracking-[0.3em] text-[var(--text-muted)]">
          Match Owner
        </p>
        <h1 className="mt-4 font-heading text-3xl font-extrabold text-[var(--primary)] sm:text-4xl">
          Waitlist — bootstrap OK
        </h1>
        <p className="mt-4 font-body text-base text-[var(--text-secondary)]">
          Fase 1 lista. La pantalla real llega en Fase 2.
        </p>
      </div>
    </main>
  );
}
