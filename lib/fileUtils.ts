export const MAX_FILE_SIZE_BYTES =
  (Number(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024;

export function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return "";
  return filename.slice(dot).toLowerCase();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function sanitizeFilename(filename: string): string {
  const base = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.slice(0, 200) || "file";
}

export function buildOutputFilename(
  inputName: string,
  outputExt: string,
  suffix?: string
): string {
  const ext = getExtension(inputName);
  const base = ext ? inputName.slice(0, -ext.length) : inputName;
  const safeBase = sanitizeFilename(base);
  const part = suffix ? `${safeBase}-${suffix}` : safeBase;
  return `${part}${outputExt}`;
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function validateFileSize(size: number): string | null {
  if (size > MAX_FILE_SIZE_BYTES) {
    const limitMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return `File is too large. Max size is ${limitMb} MB.`;
  }
  return null;
}

export function extensionLabel(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "PDF",
    ".doc": "Word",
    ".docx": "Word",
    ".ppt": "PowerPoint",
    ".pptx": "PowerPoint",
    ".xls": "Excel",
    ".xlsx": "Excel",
    ".jpg": "JPEG Image",
    ".jpeg": "JPEG Image",
    ".png": "PNG Image",
    ".webp": "WebP Image",
    ".txt": "Plain Text",
  };
  const normalized = ext.toLowerCase().startsWith(".")
    ? ext.toLowerCase()
    : `.${ext.toLowerCase()}`;
  return map[normalized] ?? normalized.toUpperCase().slice(1);
}
