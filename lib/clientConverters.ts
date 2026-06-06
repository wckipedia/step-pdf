import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import type { ConversionOptions, ConversionResult } from "@/types/conversion";
import type { ToolId } from "@/types/conversion";
import { buildOutputFilename } from "@/lib/fileUtils";

async function loadImageBytes(file: File): Promise<{
  bytes: Uint8Array;
  type: "jpg" | "png";
}> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "jpg" || ext === "jpeg") {
    return { bytes: new Uint8Array(await file.arrayBuffer()), type: "jpg" };
  }

  if (ext === "png") {
    return { bytes: new Uint8Array(await file.arrayBuffer()), type: "png" };
  }

  if (ext === "webp") {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process WebP image.");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("WebP conversion failed."))),
        "image/png"
      );
    });
    return { bytes: new Uint8Array(await blob.arrayBuffer()), type: "png" };
  }

  throw new Error("Unsupported image format.");
}

async function imageToPdf(files: File[]): Promise<ConversionResult> {
  const file = files[0];
  const { bytes, type } = await loadImageBytes(file);
  const pdf = await PDFDocument.create();
  const image =
    type === "jpg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);

  const { width, height } = image.scale(1);
  const page = pdf.addPage([width, height]);
  page.drawImage(image, { x: 0, y: 0, width, height });

  const pdfBytes = await pdf.save();
  return {
    blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" }),
    filename: buildOutputFilename(file.name, ".pdf"),
    mimeType: "application/pdf",
  };
}

async function txtToPdf(files: File[]): Promise<ConversionResult> {
  const file = files[0];
  const text = await file.text();
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const margin = 50;
  const lineHeight = fontSize * 1.4;
  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const wrapLine = (line: string): string[] => {
    const words = line.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [""];
  };

  const paragraphs = text.split(/\r?\n/);
  for (const paragraph of paragraphs) {
    const wrapped = wrapLine(paragraph);
    for (const line of wrapped) {
      if (y < margin) {
        page = pdf.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }
    y -= lineHeight * 0.5;
  }

  const pdfBytes = await pdf.save();
  return {
    blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" }),
    filename: buildOutputFilename(file.name, ".pdf"),
    mimeType: "application/pdf",
  };
}

async function mergePdf(files: File[]): Promise<ConversionResult> {
  if (files.length < 2) {
    throw new Error("Merge PDF needs at least two PDF files.");
  }

  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }

  const pdfBytes = await merged.save();
  const baseName = files[0].name.replace(/\.pdf$/i, "");
  return {
    blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" }),
    filename: buildOutputFilename(`${baseName}-merged.pdf`, ".pdf"),
    mimeType: "application/pdf",
  };
}

async function splitPdf(files: File[]): Promise<ConversionResult> {
  const file = files[0];
  const bytes = new Uint8Array(await file.arrayBuffer());
  const source = await PDFDocument.load(bytes);
  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, "") || "document";

  for (let i = 0; i < source.getPageCount(); i++) {
    const newDoc = await PDFDocument.create();
    const [page] = await newDoc.copyPages(source, [i]);
    newDoc.addPage(page);
    const pageBytes = await newDoc.save();
    zip.file(`${baseName}-page-${i + 1}.pdf`, pageBytes);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return {
    blob: zipBlob,
    filename: buildOutputFilename(file.name, ".zip", "split"),
    mimeType: "application/zip",
  };
}

async function rotatePdf(
  files: File[],
  options?: ConversionOptions
): Promise<ConversionResult> {
  const file = files[0];
  const rotation = options?.rotationDegrees ?? 90;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await PDFDocument.load(bytes);

  for (const page of pdf.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees(current + rotation));
  }

  const pdfBytes = await pdf.save();
  return {
    blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" }),
    filename: buildOutputFilename(file.name, ".pdf", "rotated"),
    mimeType: "application/pdf",
  };
}

export async function runClientConversion(
  toolId: ToolId,
  files: File[],
  options?: ConversionOptions
): Promise<ConversionResult> {
  switch (toolId) {
    case "image-to-pdf":
    case "jpg-to-pdf":
    case "png-to-pdf":
      return imageToPdf(files);
    case "txt-to-pdf":
      return txtToPdf(files);
    case "merge-pdf":
      return mergePdf(files);
    case "split-pdf":
      return splitPdf(files);
    case "rotate-pdf":
      return rotatePdf(files, options);
    default:
      throw new Error("This tool runs on the server, not in the browser.");
  }
}

export function isClientTool(toolId: ToolId): boolean {
  return [
    "image-to-pdf",
    "jpg-to-pdf",
    "png-to-pdf",
    "txt-to-pdf",
    "merge-pdf",
    "split-pdf",
    "rotate-pdf",
  ].includes(toolId);
}
