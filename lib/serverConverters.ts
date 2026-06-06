import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { requireBinary } from "@/lib/binaries";
import type { ConversionOptions } from "@/types/conversion";
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

async function pdfToJpg(
  inputPath: string,
  outputDir: string,
  originalName: string
): Promise<ServerConversionOutput> {
  const pdftoppm = await requireBinary("poppler");
  const prefix = path.join(outputDir, "page");

  await execFileAsync(
    pdftoppm,
    ["-jpeg", "-r", "150", inputPath, prefix],
    { timeout: 120000 }
  );

  const files = (await fs.readdir(outputDir))
    .filter((f) => f.startsWith("page") && f.endsWith(".jpg"))
    .sort();

  if (files.length === 0) {
    throw new Error("PDF to JPG produced no output images.");
  }

  const zip = new JSZip();
  for (const file of files) {
    const content = await fs.readFile(path.join(outputDir, file));
    zip.file(file, content);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  const baseName = path.basename(originalName, path.extname(originalName));

  return {
    buffer: zipBuffer,
    filename: `${baseName}-jpg.zip`,
    mimeType: "application/zip",
  };
}

async function protectPdf(
  inputPath: string,
  outputDir: string,
  options?: ConversionOptions
): Promise<string> {
  const qpdf = await requireBinary("qpdf");
  const password = options?.password?.trim();
  if (!password) {
    throw new Error("Password is required to protect a PDF.");
  }

  const outputPath = path.join(outputDir, "protected.pdf");
  await execFileAsync(
    qpdf,
    [
      "--encrypt",
      password,
      password,
      "256",
      "--",
      inputPath,
      outputPath,
    ],
    { timeout: 60000 }
  );

  await fs.access(outputPath);
  return outputPath;
}

export async function runServerConversion(
  toolId: ToolId,
  inputPaths: string[],
  outputDir: string,
  originalNames: string[],
  options?: ConversionOptions
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
      const outPath = await convertPdfToOffice(inputPath, outputDir, "docx");
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
    case "pdf-to-jpg":
      return pdfToJpg(inputPath, outputDir, originalName);
    case "protect-pdf": {
      const outPath = await protectPdf(inputPath, outputDir, options);
      const buffer = await fs.readFile(outPath);
      const baseName = path.basename(originalName, path.extname(originalName));
      return {
        buffer,
        filename: `${baseName}-protected.pdf`,
        mimeType: "application/pdf",
      };
    }
    default:
      throw new Error(`Server conversion not implemented for: ${toolId}`);
  }
}
