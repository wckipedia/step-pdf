import type { PDFDocumentProxy } from "pdfjs-dist";

let workerReady = false;

export async function loadPdfDocument(
  data: ArrayBuffer
): Promise<PDFDocumentProxy> {
  const pdfjs = await import("pdfjs-dist");

  if (!workerReady) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    workerReady = true;
  }

  return pdfjs.getDocument({ data }).promise;
}
