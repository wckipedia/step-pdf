import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { requireBinary, resolveBinary } from "@/lib/binaries";
import type { ToolId } from "@/types/conversion";

const execFileAsync = promisify(execFile);

export interface ServerConversionOutput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

const OFFICE_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

async function runLibreOffice(
  inputPath: string,
  outputDir: string,
  outputFormat: string,
  extraArgs: string[] = []
): Promise<string> {
  const libreoffice = await requireBinary("libreoffice");
  await execFileAsync(
    libreoffice,
    [
      "--headless",
      "--norestore",
      ...extraArgs,
      "--convert-to",
      outputFormat,
      "--outdir",
      outputDir,
      inputPath,
    ],
    { timeout: 180000 }
  );

  const baseName = path.basename(inputPath, path.extname(inputPath));
  return path.join(outputDir, `${baseName}.${outputFormat}`);
}

async function convertOfficeToPdf(
  inputPath: string,
  outputDir: string
): Promise<string> {
  const outputPath = await runLibreOffice(inputPath, outputDir, "pdf");
  await fs.access(outputPath);
  return outputPath;
}

const PDF_TO_DOCX_SCRIPT = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "scripts",
  "pdf_to_docx.py"
);

async function convertPdfToDocxWithPdf2docx(
  python: string,
  inputPath: string,
  outputDir: string
): Promise<string> {
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${baseName}.docx`);

  await execFileAsync(
    python,
    [PDF_TO_DOCX_SCRIPT, inputPath, outputPath],
    { timeout: 180000 }
  );

  await fs.access(outputPath);
  return outputPath;
}

async function convertPdfToDocx(
  inputPath: string,
  outputDir: string
): Promise<string> {
  const python = await resolveBinary("pdf2docx");
  if (python) {
    try {
      return await convertPdfToDocxWithPdf2docx(python, inputPath, outputDir);
    } catch (pdf2docxError) {
      console.warn(
        "[pdf-to-word] pdf2docx failed, falling back to LibreOffice:",
        pdf2docxError instanceof Error ? pdf2docxError.message : pdf2docxError
      );
    }
  }

  return convertPdfToOffice(inputPath, outputDir, "docx");
}

async function convertPdfToOffice(
  inputPath: string,
  outputDir: string,
  outputFormat: "docx" | "pptx"
): Promise<string> {
  const infilter =
    outputFormat === "pptx" ? "impress_pdf_import" : "writer_pdf_import";

  let outputPath: string;
  try {
    outputPath = await runLibreOffice(inputPath, outputDir, outputFormat, [
      `--infilter=${infilter}`,
    ]);
    await fs.access(outputPath);
    return outputPath;
  } catch {
    outputPath = await runLibreOffice(inputPath, outputDir, outputFormat);
    try {
      await fs.access(outputPath);
      return outputPath;
    } catch {
      throw new Error(
        `LibreOffice could not convert this PDF to .${outputFormat}. The file may be scanned, encrypted, or too complex.`
      );
    }
  }
}

async function compressPdf(
  inputPath: string,
  outputDir: string
): Promise<string> {
  const gs = await requireBinary("ghostscript");
  const outputPath = path.join(outputDir, "compressed.pdf");

  await execFileAsync(
    gs,
    [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/ebook",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ],
    { timeout: 120000 }
  );

  await fs.access(outputPath);
  return outputPath;
}

export async function runServerConversion(
  toolId: ToolId,
  inputPaths: string[],
  outputDir: string,
  originalNames: string[]
): Promise<ServerConversionOutput> {
  const inputPath = inputPaths[0];
  const originalName = originalNames[0];

  switch (toolId) {
    case "word-to-pdf":
    case "powerpoint-to-pdf":
    case "excel-to-pdf": {
      const outPath = await convertOfficeToPdf(inputPath, outputDir);
      const buffer = await fs.readFile(outPath);
      const baseName = path.basename(originalName, path.extname(originalName));
      return {
        buffer,
        filename: `${baseName}.pdf`,
        mimeType: "application/pdf",
      };
    }
    case "compress-pdf": {
      const outPath = await compressPdf(inputPath, outputDir);
      const buffer = await fs.readFile(outPath);
      const baseName = path.basename(originalName, path.extname(originalName));
      return {
        buffer,
        filename: `${baseName}-compressed.pdf`,
        mimeType: "application/pdf",
      };
    }
    case "pdf-to-word": {
      const outPath = await convertPdfToDocx(inputPath, outputDir);
      const buffer = await fs.readFile(outPath);
      const baseName = path.basename(originalName, path.extname(originalName));
      return {
        buffer,
        filename: `${baseName}.docx`,
        mimeType: OFFICE_MIME[".docx"],
      };
    }
    case "pdf-to-powerpoint": {
      const outPath = await convertPdfToOffice(inputPath, outputDir, "pptx");
      const buffer = await fs.readFile(outPath);
      const baseName = path.basename(originalName, path.extname(originalName));
      return {
        buffer,
        filename: `${baseName}.pptx`,
        mimeType: OFFICE_MIME[".pptx"],
      };
    }
    default:
      throw new Error(`Server conversion not implemented for: ${toolId}`);
  }
}
