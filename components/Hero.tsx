export default function Hero() {
  return (
    <section className="relative border-b border-border px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap gap-3">
          <span className="border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            Free PDF Rescue
          </span>
          <span className="border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            No Paywalls / No Drama
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-4">
          <div className="lg:col-span-8">
            <h1 className="font-display leading-[0.85] tracking-wide text-foreground">
              <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl">
                STUCK?
              </span>
              <span className="block text-5xl text-accent sm:text-7xl md:text-8xl lg:text-9xl">
                STEP-PDF
              </span>
              <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl">
                CAN HELP
              </span>
            </h1>
          </div>

          <div className="flex flex-col justify-end lg:col-span-4">
            <p className="mb-4 text-lg text-foreground sm:text-xl">
              Drop a file. Convert for free.
            </p>
            <p className="font-display text-2xl tracking-wide text-accent sm:text-3xl">
              &ldquo;Oh no step-pdf, I&apos;m stuck!&rdquo;
            </p>
            <div className="mt-6 space-y-1 text-[10px] font-bold uppercase tracking-[0.25em] text-muted">
              <p>Fast / Simple / Free</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
