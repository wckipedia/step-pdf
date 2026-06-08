export type ToolId =
  | "image-to-pdf"
  | "jpg-to-pdf"
  | "png-to-pdf"
  | "txt-to-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "rotate-pdf"
  | "word-to-pdf"
  | "powerpoint-to-pdf"
  | "excel-to-pdf"
  | "compress-pdf"
  | "pdf-to-word"
  | "pdf-to-powerpoint"
  | "pdf-to-jpg"
  | "protect-pdf";

export type ToolRuntime = "browser" | "server";

export type ToolCategory =
  | "Convert to PDF"
  | "Convert from PDF"
  | "Optimize PDF"
  | "Organize PDF"
  | "Edit PDF";

export interface ConversionTool {
  id: ToolId;
  name: string;
  description: string;
  category: ToolCategory;
  runtime: ToolRuntime;
  inputExtensions: string[];
  outputExtension: string;
  implemented: boolean;
  requiredBinary?:
    | "libreoffice"
    | "ghostscript"
    | "poppler"
    | "qpdf"
    | "pdf2docx";
}

export type DropzoneState =
  | "idle"
  | "drag-active"
  | "file-selected"
  | "unsupported"
  | "converting"
  | "complete"
  | "error";

export type ConversionStatus =
  | "idle"
  | "reading"
  | "finding"
  | "converting"
  | "complete"
  | "error";

export interface ConversionOptions {
  rotationDegrees?: 90 | 180 | 270;
  password?: string;
}

export interface ConversionResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}
