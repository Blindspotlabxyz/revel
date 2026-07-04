import { NextResponse } from "next/server";
import { logEvent } from "@/lib/logger";
import { getAnalysis } from "@/services/store";
import { exportToMarkdown, exportToJson } from "@/services/export-service";

export async function POST(request: Request) {
  try {
    const { id, format } = await request.json();

    if (!id || !format) {
      return NextResponse.json(
        { error: "Analysis ID and format required" },
        { status: 400 }
      );
    }

    const analysis = await getAnalysis(id);

    if (!analysis?.report) {
      return NextResponse.json(
        { error: "Report not found or not ready" },
        { status: 404 }
      );
    }

    if (format === "markdown") {
      const content = exportToMarkdown(analysis.report, analysis.website);
      logEvent("export_completed", { id, format: "markdown" });
      return NextResponse.json({
        success: true,
        content,
        filename: `revel-blueprint-${analysis.id}.md`,
      });
    }

    if (format === "json") {
      const content = exportToJson(analysis.report, analysis.website);
      logEvent("export_completed", { id, format: "json" });
      return NextResponse.json({
        success: true,
        content,
        filename: `revel-blueprint-${analysis.id}.json`,
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Export failed. Please try again." },
      { status: 500 }
    );
  }
}