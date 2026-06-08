import { NextResponse } from "next/server";
import { checkAllBinaries } from "@/lib/binaries";
import { ALL_TOOLS } from "@/lib/conversionRules";

export async function GET() {
  const binaries = await checkAllBinaries();
  const serverTools = ALL_TOOLS.filter((t) => t.runtime === "server");
  const browserTools = ALL_TOOLS.filter((t) => t.runtime === "browser");

  const unavailableServerTools = serverTools.filter(
    (tool) => tool.requiredBinary && !binaries[tool.requiredBinary]
  );

  return NextResponse.json({
    status: unavailableServerTools.length === 0 ? "ok" : "degraded",
    tools: {
      browser: browserTools.length,
      server: serverTools.length,
    },
    binaries,
    unavailableServerTools: unavailableServerTools.map((t) => ({
      id: t.id,
      name: t.name,
      requiredBinary: t.requiredBinary,
    })),
  });
}
