"use client";

import { ALL_TOOLS } from "@/lib/conversionRules";
import type { ToolCategory } from "@/types/conversion";

const CATEGORY_ORDER: ToolCategory[] = [
  "Convert to PDF",
  "Convert from PDF",
  "Optimize PDF",
  "Organize PDF",
  "Edit PDF",
];

interface ToolGridProps {
  onToolSelect?: (toolId: string) => void;
}

export default function ToolGrid({ onToolSelect }: ToolGridProps) {
  return (
    <section id="tools" className="border-b border-border px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl md:text-6xl">
          ALL THE WAYS OUT
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Browse every free tool step-pdf currently offers.
        </p>

        <div className="mt-12 space-y-12">
          {CATEGORY_ORDER.map((category) => {
            const tools = ALL_TOOLS.filter((t) => t.category === category);
            if (tools.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-accent">
                  {category}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => onToolSelect?.(tool.id)}
                      className="group flex flex-col border-2 border-border bg-card p-5 text-left transition-colors hover:border-accent"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                        {tool.category}
                      </span>
                      <span className="mt-2 font-display text-xl tracking-wide text-foreground group-hover:text-accent">
                        {tool.name.toUpperCase()}
                      </span>
                      <span className="mt-2 flex-1 text-sm text-muted">
                        {tool.description}
                      </span>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                          {tool.runtime === "browser" ? "Browser" : "Server"}
                          {!tool.implemented && " · Coming soon"}
                        </span>
                        <span
                          className="text-accent transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
