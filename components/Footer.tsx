import { ALL_TOOLS } from "@/lib/conversionRules";

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl tracking-wide lowercase text-foreground">
              step-pdf
            </p>
            <p className="mt-2 font-display text-lg text-accent">
              &ldquo;Oh no step-pdf, I&apos;m stuck!&rdquo;
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Free file conversion tools for stuck files and stressed humans.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-muted">
              Tools
            </h3>
            <ul className="mt-4 space-y-2">
              {ALL_TOOLS.map((tool) => (
                <li key={tool.id}>
                  <a
                    href="#tools"
                    className="text-sm text-foreground transition-colors hover:text-accent"
                  >
                    {tool.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-muted">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground transition-colors hover:text-accent"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          id="faq"
          className="mt-12 border-t border-border pt-8"
        >
          <h3 className="font-display text-2xl tracking-wide text-foreground">
            FAQ
          </h3>
          <dl className="mt-6 space-y-6">
            <div>
              <dt className="font-medium text-foreground">Is step-pdf really free?</dt>
              <dd className="mt-1 text-sm text-muted">
                Yes. No paywalls, no accounts, no credit card. Free forever.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Do you store my files?</dt>
              <dd className="mt-1 text-sm text-muted">
                No. Files are processed in temporary storage and deleted immediately after conversion.
              </dd>
            </div>
            <div id="free-forever">
              <dt className="font-medium text-foreground">Why do some tools say Server?</dt>
              <dd className="mt-1 text-sm text-muted">
                Office and advanced PDF tools need native binaries (LibreOffice, Ghostscript, etc.) on the server. Browser tools run entirely in your browser.
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-12 text-xs uppercase tracking-widest text-muted">
          © {year} step-pdf. All conversions, zero panic.
        </p>
      </div>
    </footer>
  );
}
