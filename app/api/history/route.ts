import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getAllAnalyses, deleteAnalysis } from "@/services/store";

export async function GET() {
  const userId = await getCurrentUserId();
  const analyses = await getAllAnalyses(userId);

  const history = analyses.map(({ id, website, status, score, createdAt }) => ({
    id,
    website,
    status,
    score,
    createdAt,
  }));

  return NextResponse.json(history);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const deleted = await deleteAnalysis(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}