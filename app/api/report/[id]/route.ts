import { NextResponse } from "next/server";
import { userCanAccessAnalysis } from "@/lib/security/analysis-access";
import { getAnalysis } from "@/services/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const analysis = await getAnalysis(id);

  if (!analysis) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (!(await userCanAccessAnalysis(analysis))) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json(analysis);
}