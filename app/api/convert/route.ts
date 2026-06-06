import { NextRequest, NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import { getToolById } from "@/lib/conversionRules";
import {
  getExtension,
  MAX_FILE_SIZE_BYTES,
  sanitizeFilename,
  validateFileSize,
} from "@/lib/fileUtils";
import { createTempDir, writeTempFile, cleanupTempDir } from "@/lib/tempFiles";
import { runServerConversion } from "@/lib/serverConverters";
import type { ConversionOptions, ToolId } from "@/types/conversion";

export const maxDuration = 300;

const ALLOWED_MIME_OVERRIDES: Record<string, string[]> = {
  ".doc": [
    "application/msword",
    "application/x-msword",
    "application/octet-stream",
  ],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/octet-stream",
  ],
  ".ppt": [
    "application/vnd.ms-powerpoint",
    "application/x-mspowerpoint",
    "application/octet-stream",
  ],
  ".pptx": [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/octet-stream",
  ],
  ".xls": [
    "application/vnd.ms-excel",
    "application/x-ms-excel",
    "application/octet-stream",
  ],
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/octet-stream",
  ],
  ".pdf": ["application/pdf", "application/octet-stream"],
};

function parseOptions(raw: string | null): ConversionOptions {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ConversionOptions;
  } catch {
    return {};
  }
}

async function validateFileBuffer(
  buffer: Buffer,
  expectedExt: string
): Promise<string | null> {
  const detected = await fileTypeFromBuffer(buffer);
  const allowed = ALLOWED_MIME_OVERRIDES[expectedExt];

  if (!detected) {
    if (expectedExt === ".txt") return null;
    if (allowed) return null;
    return "Could not verify file type.";
  }

  if (allowed && !allowed.includes(detected.mime)) {
    return `File type mismatch. Expected ${expectedExt} file.`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  let tempDir: string | null = null;

  try {
    const formData = await request.formData();
    const toolId = formData.get("toolId") as string | null;
    const optionsRaw = formData.get("options") as string | null;
    const fileEntries = formData.getAll("files");

    if (!toolId) {
      return NextResponse.json({ error: "Missing toolId." }, { status: 400 });
    }

    const tool = getToolById(toolId as ToolId);
    if (!tool || !tool.implemented || tool.runtime !== "server") {
      return NextResponse.json(
        { error: "Unknown or unsupported server tool." },
        { status: 400 }
      );
    }

    const files = fileEntries.filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    if (tool.id !== "merge-pdf" && files.length > 1) {
      return NextResponse.json(
        { error: "This tool accepts only one file." },
        { status: 400 }
      );
    }

    const options = parseOptions(optionsRaw);
    tempDir = await createTempDir();
    const inputPaths: string[] = [];
    const originalNames: string[] = [];

    for (const file of files) {
      const sizeError = validateFileSize(file.size);
      if (sizeError) {
        return NextResponse.json({ error: sizeError }, { status: 400 });
      }

      const ext = getExtension(file.name);
      if (!tool.inputExtensions.includes(ext)) {
        return NextResponse.json(
          {
            error: `Invalid file type for ${tool.name}. Accepted: ${tool.inputExtensions.join(", ")}`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "File exceeds maximum size limit." },
          { status: 400 }
        );
      }

      const typeError = await validateFileBuffer(buffer, ext);
      if (typeError) {
        return NextResponse.json({ error: typeError }, { status: 400 });
      }

      const safeName = sanitizeFilename(file.name);
      originalNames.push(safeName);
      const inputPath = await writeTempFile(tempDir, buffer, ext);
      inputPaths.push(inputPath);
    }

    const result = await runServerConversion(
      tool.id,
      inputPaths,
      tempDir,
      originalNames,
      options
    );

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "X-Output-Filename": result.filename,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The file fought back. Try again or pick another tool.";

    console.error("[convert] Conversion failed:", message);

    const status = message.includes("needs ") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  } finally {
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }
  }
}
