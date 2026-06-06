"use client";

import { useCallback, useRef, useState } from "react";
import type { DropzoneState } from "@/types/conversion";
import { formatFileSize } from "@/lib/fileUtils";

interface FileDropzoneProps {
  state: DropzoneState;
  files: File[];
  errorMessage?: string;
  onFilesSelected: (files: File[]) => void;
  onReset: () => void;
  allowMultiple?: boolean;
}

export default function FileDropzone({
  state,
  files,
  errorMessage,
  onFilesSelected,
  onReset,
  allowMultiple = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming || incoming.length === 0) return;
      const list = Array.from(incoming);
      onFilesSelected(allowMultiple ? list : [list[0]]);
    },
    [allowMultiple, onFilesSelected]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const borderClass = () => {
    if (state === "unsupported" || state === "error") return "border-red-500";
    if (state === "complete") return "border-green-500";
    if (state === "converting") return "border-accent animate-pulse";
    if (isDragging || state === "drag-active") return "border-accent bg-accent/5";
    if (state === "file-selected") return "border-foreground";
    return "border-border hover:border-muted";
  };

  const mainText = () => {
    if (state === "converting") return "CONVERTING YOUR FILE…";
    if (state === "complete") return "UNSTUCK. READY TO DOWNLOAD.";
    if (state === "unsupported") return "EXTRA STUCK FILE DETECTED";
    if (state === "error") return "SOMETHING WENT WRONG";
    if (state === "file-selected") return "FILE LOCKED IN";
    if (isDragging) return "DROP IT. WE GOT YOU.";
    return "DROP YOUR STUCK FILE HERE";
  };

  return (
    <div id="upload" className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload file drop zone"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => state !== "converting" && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`cursor-pointer border-2 border-dashed bg-card p-8 transition-colors sm:p-12 ${borderClass()} ${state === "converting" ? "pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          multiple={allowMultiple}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <div className="text-center">
          <p className="font-display text-2xl tracking-wide text-foreground sm:text-4xl">
            {mainText()}
          </p>
          {state === "converting" && (
            <p className="mt-3 text-sm text-muted">
              Hang tight — bigger files can take a minute.
            </p>
          )}
          {state !== "converting" && state !== "complete" && (
            <>
              <p className="mt-3 text-sm text-muted">
                or click to choose a file
              </p>
              <p className="mt-2 text-xs uppercase tracking-widest text-muted">
                PDF, Word, PowerPoint, Excel, images, and more.
              </p>
            </>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-6 border-t border-border pt-6">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="truncate font-medium text-foreground">
                  {file.name}
                </span>
                <span className="shrink-0 text-muted">
                  {formatFileSize(file.size)}
                </span>
              </div>
            ))}
            {state !== "converting" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                className="mt-4 text-xs font-bold uppercase tracking-widest text-accent hover:underline"
              >
                Clear & pick another
              </button>
            )}
          </div>
        )}

        {errorMessage && state === "error" && (
          <p className="mt-4 text-center text-sm text-red-400" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
