import fs from "fs/promises";
import path from "path";
import os from "os";
import { nanoid } from "nanoid";

export async function createTempDir(): Promise<string> {
  const dir = path.join(os.tmpdir(), `step-pdf-${nanoid()}`);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function writeTempFile(
  dir: string,
  buffer: Buffer,
  extension: string
): Promise<string> {
  const safeExt = extension.startsWith(".") ? extension : `.${extension}`;
  const filename = `${nanoid()}${safeExt}`;
  const filepath = path.join(dir, filename);

  const resolved = path.resolve(filepath);
  const resolvedDir = path.resolve(dir);
  if (!resolved.startsWith(resolvedDir + path.sep)) {
    throw new Error("Invalid file path.");
  }

  await fs.writeFile(filepath, buffer);
  return filepath;
}

export async function cleanupTempDir(dir: string): Promise<void> {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup; avoid leaking paths in logs.
  }
}
