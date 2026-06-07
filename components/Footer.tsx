const visionPoints = [
  {
    label: "The problem",
    text: "You need a PDF converted. The internet offers twelve paywalls, a login screen, and a tool that hasn't worked since 2019.",
  },
  {
    label: "The idea",
    text: "step-pdf is the rescue lane — drop a file, pick what you need, download it. No account. No credit card. No \"upgrade to Pro\" guilt trip.",
  },
  {
    label: "The promise",
    text: "Free forever, fast when it can be, honest when it can't. Your files aren't stored. Your panic is optional.",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h3 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
            WHY STEP-PDF EXISTS
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Everyone hits the same wall — wrong file format, deadline looming,
            some website asking for $9.99/month to rotate a PDF. I built
            step-pdf because that&apos;s ridiculous.
          </p>

          <div className="mt-8 space-y-6">
            {visionPoints.map((point) => (
              <div
                key={point.label}
                className="border-l-2 border-accent pl-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
                  {point.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div id="faq" className="mt-12 border-t border-border pt-8">
          <h3 className="font-display text-2xl tracking-wide text-foreground">
            FAQ
          </h3>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div id="free-forever">
              <dt className="font-medium text-foreground">
                Is step-pdf really free?
              </dt>
              <dd className="mt-1 text-sm text-muted">
                Yes. No paywalls, no accounts, no credit card. Free forever.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                Do you store my files?
              </dt>
              <dd className="mt-1 text-sm text-muted">
                No. Files are processed in temporary storage and deleted
                immediately after conversion.
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-10 text-xs uppercase tracking-widest text-muted">
          © {year} step-pdf. All conversions, zero panic.
        </p>
      </div>
    </footer>
  );
}
