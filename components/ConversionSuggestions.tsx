"use client";

import { useState } from "react";
import type {
  ConversionStatus,
  ConversionTool,
  ConversionResult,
} from "@/types/conversion";
import { extensionLabel } from "@/lib/fileUtils";
import {
  isClientTool,
  runClientConversion,
} from "@/lib/clientConverters";
import { triggerDownload } from "@/lib/fileUtils";

interface ConversionSuggestionsProps {
  files: File[];
  extension: string;
  tools: ConversionTool[];
  isUnsupported: boolean;
  onConverting: (active: boolean) => void;
  onComplete: () => void;
  onError: (message: string) => void;
  onViewAllTools: () => void;
}

const STATUS_MESSAGES: Record<ConversionStatus, string> = {
  idle: "",
  reading: "Reading your file…",
  finding: "Finding escape routes…",
  converting: "Converting… this can take a minute.",
  complete: "Unstuck. Ready to download.",
  error: "",
};

export default function ConversionSuggestions({
  files,
  extension,
  tools,
  isUnsupported,
  onConverting,
  onComplete,
  onError,
  onViewAllTools,
}: ConversionSuggestionsProps) {
  const [status, setStatus] = useState<ConversionStatus>("idle");
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [password, setPassword] = useState("");

  const handleConvert = async (tool: ConversionTool) => {
    if (!tool.implemented) return;

    if (tool.id === "merge-pdf" && files.length < 2) {
      onError("Merge PDF needs at least two PDF files. Drop multiple PDFs to merge.");
      return;
    }

    setActiveToolId(tool.id);
    setResult(null);
    onConverting(true);

    try {
      setStatus("reading");
      await new Promise((r) => setTimeout(r, 300));
      setStatus("finding");
      await new Promise((r) => setTimeout(r, 300));
      setStatus("converting");

      let conversionResult: ConversionResult;

      if (isClientTool(tool.id)) {
        conversionResult = await runClientConversion(
          tool.id,
          files,
          tool.id === "protect-pdf" ? { password } : undefined
        );
      } else {
        const formData = new FormData();
        formData.append("toolId", tool.id);
        files.forEach((f) => formData.append("files", f));
        if (tool.id === "protect-pdf" && password) {
          formData.append("options", JSON.stringify({ password }));
        }

        const response = await fetch("/api/convert", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error ?? "The file fought back. Try again or pick another tool."
          );
        }

        const blob = await response.blob();
        const filename =
          response.headers.get("X-Output-Filename") ??
          `converted${tool.outputExtension}`;
        conversionResult = {
          blob,
          filename,
          mimeType: blob.type || "application/octet-stream",
        };
      }

      setResult(conversionResult);
      setStatus("complete");
      onComplete();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "The file fought back. Try again or pick another tool.";
      setStatus("error");
      onError(message);
      onConverting(false);
    } finally {
      setActiveToolId(null);
    }
  };

  if (files.length === 0) return null;

  if (isUnsupported) {
    return (
      <div className="border-2 border-border bg-card p-6 sm:p-8">
        <h3 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
          HMM. THIS FILE IS EXTRA STUCK.
        </h3>
        <p className="mt-3 text-muted">
          We don&apos;t support this format yet, but you can view all tools below.
        </p>
        <button
          type="button"
          onClick={onViewAllTools}
          className="mt-6 border-2 border-accent px-6 py-3 text-xs font-bold uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-black"
        >
          View all tools
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Detected: {extensionLabel(extension)}
        </p>
        <h3 className="mt-2 font-display text-2xl tracking-wide text-foreground sm:text-3xl">
          HERE&apos;S HOW STEP-PDF CAN UNSTICK IT:
        </h3>
        {files.length > 1 && (
          <p className="mt-2 text-sm text-muted">
            Multiple files detected. Only Merge PDF uses all files; other tools use the first file.
          </p>
        )}
      </div>

      {status !== "idle" && status !== "error" && (
        <p
          className={`text-sm font-medium ${status === "complete" ? "text-green-400" : "text-accent"}`}
          role="status"
          aria-live="polite"
        >
          {STATUS_MESSAGES[status]}
        </p>
      )}

      {result && status === "complete" && (
        <div className="border-2 border-green-500 bg-card p-6">
          <p className="font-display text-xl tracking-wide text-green-400">
            UNSTUCK. YOUR FILE IS READY.
          </p>
          <button
            type="button"
            onClick={() => triggerDownload(result.blob, result.filename)}
            className="mt-4 border-2 border-accent bg-accent px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-transparent hover:text-accent"
          >
            Download {result.filename}
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => {
          const isActive = activeToolId === tool.id;
          const needsPassword = tool.id === "protect-pdf";
          const needsMultiple = tool.id === "merge-pdf";

          return (
            <article
              key={tool.id}
              className="flex flex-col border-2 border-border bg-card p-5"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
                Escape Route
              </span>
              <h4 className="mt-2 font-display text-xl tracking-wide text-foreground">
                {tool.name.toUpperCase()}
              </h4>
              <p className="mt-2 flex-1 text-sm text-muted">{tool.description}</p>

              {needsMultiple && files.length < 2 && (
                <p className="mt-4 text-[10px] uppercase tracking-widest text-muted">
                  Needs 2+ PDFs
                </p>
              )}

              {needsPassword && (
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-3 border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
                  aria-label="PDF password"
                />
              )}

              <button
                type="button"
                disabled={
                  isActive ||
                  activeToolId !== null ||
                  !tool.implemented ||
                  (needsMultiple && files.length < 2) ||
                  (needsPassword && !password.trim())
                }
                onClick={() => handleConvert(tool)}
                className="mt-4 w-full border-2 border-foreground py-3 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isActive ? "Converting…" : "Convert"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
