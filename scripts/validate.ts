import { ALL_TOOLS, getToolsForExtension } from "../lib/conversionRules";
import type { ToolId } from "../types/conversion";

const BROWSER_TOOL_IDS = new Set<ToolId>([
  "image-to-pdf",
  "jpg-to-pdf",
  "png-to-pdf",
  "txt-to-pdf",
  "merge-pdf",
  "split-pdf",
  "rotate-pdf",
]);

const SERVER_TOOL_IDS = new Set<ToolId>([
  "word-to-pdf",
  "powerpoint-to-pdf",
  "excel-to-pdf",
  "compress-pdf",
  "pdf-to-word",
  "pdf-to-powerpoint",
  "pdf-to-jpg",
  "protect-pdf",
]);

function fail(errors: string[]): never {
  for (const error of errors) {
    console.error(`validate: ${error}`);
  }
  throw new Error(`validation failed (${errors.length} error(s))`);
}

const errors: string[] = [];
const seenIds = new Set<ToolId>();

for (const tool of ALL_TOOLS) {
  if (seenIds.has(tool.id)) {
    errors.push(`duplicate tool id: ${tool.id}`);
  }
  seenIds.add(tool.id);

  if (!tool.implemented) continue;

  if (tool.runtime === "browser" && !BROWSER_TOOL_IDS.has(tool.id)) {
    errors.push(
      `implemented browser tool ${tool.id} is missing from clientConverters`
    );
  }

  if (tool.runtime === "server" && !SERVER_TOOL_IDS.has(tool.id)) {
    errors.push(
      `implemented server tool ${tool.id} is missing from serverConverters`
    );
  }

  if (tool.runtime === "server" && !tool.requiredBinary) {
    errors.push(`server tool ${tool.id} is missing requiredBinary`);
  }

  for (const ext of tool.inputExtensions) {
    const normalized = ext.toLowerCase().startsWith(".")
      ? ext.toLowerCase()
      : `.${ext.toLowerCase()}`;

    const matches = getToolsForExtension(normalized).some((t) => t.id === tool.id);
    if (!matches) {
      errors.push(
        `tool ${tool.id} accepts ${normalized} but getToolsForExtension does not return it`
      );
    }
  }
}

for (const id of BROWSER_TOOL_IDS) {
  const tool = ALL_TOOLS.find((t) => t.id === id);
  if (!tool?.implemented || tool.runtime !== "browser") {
    errors.push(`clientConverters tool ${id} is not an implemented browser tool`);
  }
}

for (const id of SERVER_TOOL_IDS) {
  const tool = ALL_TOOLS.find((t) => t.id === id);
  if (!tool?.implemented || tool.runtime !== "server") {
    errors.push(`serverConverters tool ${id} is not an implemented server tool`);
  }
}

if (errors.length > 0) {
  fail(errors);
}

console.log(`validate: tool registry OK (${ALL_TOOLS.length} tools)`);
