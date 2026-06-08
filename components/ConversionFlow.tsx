"use client";

import { useCallback, useMemo, useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import ConversionSuggestions from "@/components/ConversionSuggestions";
import {
  getToolsForExtension,
  isSupportedExtension,
} from "@/lib/conversionRules";
import { getExtension, validateFileSize } from "@/lib/fileUtils";
import type { DropzoneState } from "@/types/conversion";

export default function ConversionFlow() {
  const [files, setFiles] = useState<File[]>([]);
  const [dropzoneState, setDropzoneState] = useState<DropzoneState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const extension = useMemo(
    () => (files[0] ? getExtension(files[0].name) : ""),
    [files]
  );

  const tools = useMemo(
    () => (extension ? getToolsForExtension(extension) : []),
    [extension]
  );

  const isUnsupported = files.length > 0 && !isSupportedExtension(extension);

  const handleFilesSelected = useCallback((incoming: File[]) => {
    setErrorMessage("");

    for (const file of incoming) {
      const sizeError = validateFileSize(file.size);
      if (sizeError) {
        setErrorMessage(sizeError);
        setDropzoneState("error");
        return;
      }
    }

    const allPdf =
      incoming.length > 1 &&
      incoming.every((f) => getExtension(f.name) === ".pdf");
    const selected = allPdf ? incoming : [incoming[0]];

    setFiles(selected);
    const ext = getExtension(selected[0].name);

    if (!isSupportedExtension(ext)) {
      setDropzoneState("unsupported");
    } else {
      setDropzoneState("file-selected");
    }
  }, []);

  const handleReset = useCallback(() => {
    setFiles([]);
    setDropzoneState("idle");
    setErrorMessage("");
  }, []);

  const handleConverting = useCallback((active: boolean) => {
    if (active) {
      setErrorMessage("");
      setDropzoneState("converting");
      return;
    }
    setDropzoneState((prev) =>
      prev === "converting" ? "file-selected" : prev
    );
  }, []);

  const handleComplete = useCallback(() => {
    setDropzoneState("complete");
  }, []);

  const handleError = useCallback((message: string) => {
    if (!message) {
      setErrorMessage("");
      return;
    }
    setErrorMessage(message);
    setDropzoneState("error");
  }, []);

  const scrollToTools = () => {
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        <FileDropzone
          state={dropzoneState}
          files={files}
          errorMessage={errorMessage}
          onFilesSelected={handleFilesSelected}
          onReset={handleReset}
          allowMultiple
        />

        <ConversionSuggestions
          files={files}
          extension={extension}
          tools={tools}
          isUnsupported={isUnsupported}
          onConverting={handleConverting}
          onComplete={handleComplete}
          onError={handleError}
          onViewAllTools={scrollToTools}
        />
      </div>
    </section>
  );
}
