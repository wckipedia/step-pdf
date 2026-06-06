const steps = [
  {
    number: "01",
    title: "Drop the stuck file",
    description: "Drag, drop, or click. PDF, Office docs, images, text — bring the chaos.",
  },
  {
    number: "02",
    title: "Pick the way out",
    description: "We detect your file type and show the escape routes that actually work.",
  },
  {
    number: "03",
    title: "Download the converted file",
    description: "Unstuck. Your file is ready. No paywall. No account. No drama.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-b border-border px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl md:text-6xl">
          THREE STEPS. ZERO PANIC.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="border-2 border-border bg-card p-6"
            >
              <span className="font-display text-5xl text-accent">
                {step.number}
              </span>
              <h3 className="mt-4 font-display text-2xl tracking-wide text-foreground">
                {step.title.toUpperCase()}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
