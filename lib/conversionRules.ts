import type { ConversionTool, ToolId } from "@/types/conversion";

export const ALL_TOOLS: ConversionTool[] = [
  {
    id: "word-to-pdf",
    name: "Word to PDF",
    description: "Turn .doc and .docx files into clean PDFs.",
    category: "Convert to PDF",
    runtime: "server",
    inputExtensions: [".doc", ".docx"],
    outputExtension: ".pdf",
    implemented: true,
    requiredBinary: "libreoffice",
  },
  {
    id: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    description: "Slide decks become shareable PDFs.",
    category: "Convert to PDF",
    runtime: "server",
    inputExtensions: [".ppt", ".pptx"],
    outputExtension: ".pdf",
    implemented: true,
    requiredBinary: "libreoffice",
  },
  {
    id: "excel-to-pdf",
    name: "Excel to PDF",
    description: "Spreadsheets exported as PDF pages.",
    category: "Convert to PDF",
    runtime: "server",
    inputExtensions: [".xls", ".xlsx"],
    outputExtension: ".pdf",
    implemented: true,
    requiredBinary: "libreoffice",
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    description: "JPEG images wrapped into a PDF.",
    category: "Convert to PDF",
    runtime: "browser",
    inputExtensions: [".jpg", ".jpeg"],
    outputExtension: ".pdf",
    implemented: true,
  },
  {
    id: "png-to-pdf",
    name: "PNG to PDF",
    description: "PNG images become a single PDF.",
    category: "Convert to PDF",
    runtime: "browser",
    inputExtensions: [".png"],
    outputExtension: ".pdf",
    implemented: true,
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    description: "JPG, PNG, or WebP to PDF in your browser.",
    category: "Convert to PDF",
    runtime: "browser",
    inputExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    outputExtension: ".pdf",
    implemented: true,
  },
  {
    id: "txt-to-pdf",
    name: "TXT to PDF",
    description: "Plain text formatted into a readable PDF.",
    category: "Convert to PDF",
    runtime: "browser",
    inputExtensions: [".txt"],
    outputExtension: ".pdf",
    implemented: true,
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    description: "Shrink PDF file size without the drama.",
    category: "Optimize PDF",
    runtime: "server",
    inputExtensions: [".pdf"],
    outputExtension: ".pdf",
    implemented: true,
    requiredBinary: "ghostscript",
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one escape route.",
    category: "Organize PDF",
    runtime: "browser",
    inputExtensions: [".pdf"],
    outputExtension: ".pdf",
    implemented: true,
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    description: "Split every page into its own PDF, zipped.",
    category: "Organize PDF",
    runtime: "browser",
    inputExtensions: [".pdf"],
    outputExtension: ".zip",
    implemented: true,
  },
  {
    id: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate all pages 90° clockwise.",
    category: "Edit PDF",
    runtime: "browser",
    inputExtensions: [".pdf"],
    outputExtension: ".pdf",
    implemented: true,
  },
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Turn a PDF into an editable .docx file.",
    category: "Convert from PDF",
    runtime: "server",
    inputExtensions: [".pdf"],
    outputExtension: ".docx",
    implemented: true,
    requiredBinary: "libreoffice",
  },
  {
    id: "pdf-to-powerpoint",
    name: "PDF to PowerPoint",
    description: "Convert PDF pages into a .pptx slide deck.",
    category: "Convert from PDF",
    runtime: "server",
    inputExtensions: [".pdf"],
    outputExtension: ".pptx",
    implemented: true,
    requiredBinary: "libreoffice",
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    description: "Export PDF pages as JPEG images in a zip.",
    category: "Convert from PDF",
    runtime: "server",
    inputExtensions: [".pdf"],
    outputExtension: ".zip",
    implemented: true,
    requiredBinary: "poppler",
  },
  {
    id: "protect-pdf",
    name: "Protect PDF",
    description: "Add password protection to your PDF.",
    category: "Edit PDF",
    runtime: "server",
    inputExtensions: [".pdf"],
    outputExtension: ".pdf",
    implemented: true,
    requiredBinary: "qpdf",
  },
];

const EXTENSION_RULES: Record<string, ToolId[]> = {
  ".ppt": ["powerpoint-to-pdf"],
  ".pptx": ["powerpoint-to-pdf"],
  ".doc": ["word-to-pdf"],
  ".docx": ["word-to-pdf"],
  ".xls": ["excel-to-pdf"],
  ".xlsx": ["excel-to-pdf"],
  ".jpg": ["image-to-pdf", "jpg-to-pdf"],
  ".jpeg": ["image-to-pdf", "jpg-to-pdf"],
  ".png": ["image-to-pdf", "png-to-pdf"],
  ".webp": ["image-to-pdf"],
  ".pdf": [
    "pdf-to-word",
    "pdf-to-powerpoint",
    "compress-pdf",
    "merge-pdf",
    "split-pdf",
    "rotate-pdf",
    "pdf-to-jpg",
    "protect-pdf",
  ],
  ".txt": ["txt-to-pdf"],
};

export function getToolById(id: ToolId): ConversionTool | undefined {
  return ALL_TOOLS.find((t) => t.id === id);
}

export function getToolsForExtension(ext: string): ConversionTool[] {
  const normalized = ext.toLowerCase().startsWith(".")
    ? ext.toLowerCase()
    : `.${ext.toLowerCase()}`;
  const ids = EXTENSION_RULES[normalized] ?? [];
  return ids
    .map((id) => getToolById(id))
    .filter((t): t is ConversionTool => t !== undefined && t.implemented);
}

export function isSupportedExtension(ext: string): boolean {
  const normalized = ext.toLowerCase().startsWith(".")
    ? ext.toLowerCase()
    : `.${ext.toLowerCase()}`;
  return normalized in EXTENSION_RULES;
}

export function getToolsByCategory(): Record<string, ConversionTool[]> {
  const grouped: Record<string, ConversionTool[]> = {};
  for (const tool of ALL_TOOLS) {
    if (!grouped[tool.category]) grouped[tool.category] = [];
    grouped[tool.category].push(tool);
  }
  return grouped;
}
