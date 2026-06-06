import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export type BinaryName = "libreoffice" | "ghostscript" | "poppler" | "qpdf";

const BINARY_COMMANDS: Record<
  BinaryName,
  { commands: string[]; versionArgs: string[] }
> = {
  libreoffice: {
    commands: ["soffice", "libreoffice"],
    versionArgs: ["--version"],
  },
  ghostscript: {
    commands: ["gs", "gswin64c", "gswin32c"],
    versionArgs: ["--version"],
  },
  poppler: {
    commands: ["pdftoppm"],
    versionArgs: ["-v"],
  },
  qpdf: {
    commands: ["qpdf"],
    versionArgs: ["--version"],
  },
};

const INSTALL_MESSAGES: Record<BinaryName, string> = {
  libreoffice:
    "This escape route needs LibreOffice installed on the server. Install with: brew install --cask libreoffice (macOS) or apt install libreoffice (Linux).",
  ghostscript:
    "This escape route needs Ghostscript installed on the server. Install with: brew install ghostscript (macOS) or apt install ghostscript (Linux).",
  poppler:
    "This escape route needs Poppler installed on the server. Install with: brew install poppler (macOS) or apt install poppler-utils (Linux).",
  qpdf:
    "This escape route needs qpdf installed on the server. Install with: brew install qpdf (macOS) or apt install qpdf (Linux).",
};

const resolvedCache = new Map<BinaryName, string | null>();

async function tryCommand(
  command: string,
  args: string[]
): Promise<boolean> {
  try {
    await execFileAsync(command, args, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export async function resolveBinary(name: BinaryName): Promise<string | null> {
  if (resolvedCache.has(name)) {
    return resolvedCache.get(name) ?? null;
  }

  const config = BINARY_COMMANDS[name];
  for (const cmd of config.commands) {
    if (await tryCommand(cmd, config.versionArgs)) {
      resolvedCache.set(name, cmd);
      return cmd;
    }
  }

  resolvedCache.set(name, null);
  return null;
}

export async function requireBinary(name: BinaryName): Promise<string> {
  const cmd = await resolveBinary(name);
  if (!cmd) {
    throw new Error(INSTALL_MESSAGES[name]);
  }
  return cmd;
}

export function getInstallMessage(name: BinaryName): string {
  return INSTALL_MESSAGES[name];
}

export async function checkAllBinaries(): Promise<
  Record<BinaryName, boolean>
> {
  const names: BinaryName[] = [
    "libreoffice",
    "ghostscript",
    "poppler",
    "qpdf",
  ];
  const results = await Promise.all(
    names.map(async (name) => ({
      name,
      available: (await resolveBinary(name)) !== null,
    }))
  );
  return Object.fromEntries(
    results.map((r) => [r.name, r.available])
  ) as Record<BinaryName, boolean>;
}
