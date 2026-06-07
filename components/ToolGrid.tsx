"use client";

import { useState } from "react";
import { ALL_TOOLS } from "@/lib/conversionRules";
import type { ConversionTool, ToolCategory } from "@/types/conversion";

const CATEGORY_ORDER: ToolCategory[] = [
  "Convert to PDF",
  "Convert from PDF",
  "Optimize PDF",
  "Organize PDF",
  "Edit PDF",
];

const CATEGORY_SHORT: Record<ToolCategory, string> = {
  "Convert to PDF": "To PDF",
  "Convert from PDF": "From PDF",
  "Optimize PDF": "Optimize",
  "Organize PDF": "Organize",
  "Edit PDF": "Edit",
};

interface ToolGridProps {
  onToolSelect?: (toolId: string) => void;
}

function scrollToUpload() {
  document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
}

function ToolRow({
  tool,
  onSelect,
}: {
  tool: ConversionTool;
  onSelect?: (toolId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect?.(tool.id);
        scrollToUpload();
      }}
      className="group grid w-full grid-cols-1 gap-2 border-b border-border px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-card sm:grid-cols-[minmax(140px,1fr)_1.5fr_auto] sm:items-center sm:gap-6"
    >
      <span className="font-display text-lg tracking-wide text-foreground transition-colors group-hover:text-accent sm:text-xl">
        {tool.name}
      </span>

      <span className="text-sm leading-relaxed text-muted">
        {tool.description}
      </span>

      <span
        className="text-accent opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 sm:text-right sm:opacity-40"
        aria-hidden="true"
      >
        →
      </span>
    </button>
  );
}

export default function ToolGrid({ onToolSelect }: ToolGridProps) {
  const [activeCategory, setActiveCategory] =
    useState<ToolCategory>("Convert to PDF");

  const categoriesWithTools = CATEGORY_ORDER.filter((category) =>
    ALL_TOOLS.some((t) => t.category === category)
  );

  const activeTools = ALL_TOOLS.filter((t) => t.category === activeCategory);

  return (
    <section
      id="tools"
      className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl md:text-6xl">
              ALL THE WAYS OUT
            </h2>
            <p className="mt-4 max-w-lg text-muted">
              Browse every free tool step-pdf currently offers.
            </p>
          </div>

          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            <span className="text-foreground">{ALL_TOOLS.length}</span> tools
          </span>
        </div>

        <div
          className="mt-10 flex gap-1 overflow-x-auto border-b border-border pb-px"
          role="tablist"
          aria-label="Tool categories"
        >
          {categoriesWithTools.map((category) => {
            const count = ALL_TOOLS.filter((t) => t.category === category).length;
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {CATEGORY_SHORT[category]}
                <span
                  className={`ml-2 ${isActive ? "text-accent/70" : "text-border"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="border border-border bg-card/50"
          role="tabpanel"
          aria-label={activeCategory}
        >
          <div className="hidden border-b border-border bg-background px-5 py-2 sm:grid sm:grid-cols-[minmax(140px,1fr)_1.5fr_auto] sm:gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">
              Tool
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">
              What it does
            </span>
            <span className="sr-only">Action</span>
          </div>

          {activeTools.map((tool) => (
            <ToolRow key={tool.id} tool={tool} onSelect={onToolSelect} />
          ))}
        </div>

      </div>
    </section>
  );
}
