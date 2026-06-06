"use client";

const links = [
  { href: "#tools", label: "Tools" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
  { href: "#free-forever", label: "Free Forever" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <a
          href="#"
          className="font-display text-2xl tracking-wide text-foreground lowercase sm:text-3xl"
        >
          step-pdf
        </a>

        <ul className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-xs font-medium uppercase tracking-widest text-muted transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#upload"
          className="border-2 border-accent bg-accent px-4 py-2 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-transparent hover:text-accent"
        >
          Unstick a file
        </a>
      </nav>
    </header>
  );
}
