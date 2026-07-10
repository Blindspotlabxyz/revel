import { promises as fs } from "fs";
import path from "path";
import { normalizeAnalysisReport } from "@/lib/report-schema";
import type { Analysis } from "@/types/analysis";

const DATA_DIR = path.join(process.cwd(), "data");
const ANALYSES_FILE = path.join(DATA_DIR, "analyses.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function hydrateAnalysis(analysis: Analysis): Analysis {
  if (!analysis.report) return analysis;
  const report = normalizeAnalysisReport(analysis.report);
  return {
    ...analysis,
    score: report.score ?? analysis.score,
    report,
  };
}

async function readAnalyses(): Promise<Analysis[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ANALYSES_FILE, "utf-8");
    const list = JSON.parse(data) as Analysis[];
    return list.map(hydrateAnalysis);
  } catch {
    return [];
  }
}

async function writeAnalyses(analyses: Analysis[]) {
  await ensureDataDir();
  await fs.writeFile(ANALYSES_FILE, JSON.stringify(analyses, null, 2));
}

export async function getAnalysisFromFile(
  id: string
): Promise<Analysis | null> {
  const analyses = await readAnalyses();
  return analyses.find((a) => a.id === id) ?? null;
}

export async function getAllAnalysesFromFile(
  userId?: string | null
): Promise<Analysis[]> {
  const analyses = await readAnalyses();
  const filtered = userId
    ? analyses.filter((a) => a.userId === userId)
    : analyses;

  return filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function saveAnalysisToFile(analysis: Analysis): Promise<void> {
  const analyses = await readAnalyses();
  const index = analyses.findIndex((a) => a.id === analysis.id);
  if (index >= 0) {
    analyses[index] = analysis;
  } else {
    analyses.unshift(analysis);
  }
  await writeAnalyses(analyses);
}

export async function deleteAnalysisFromFile(id: string): Promise<boolean> {
  const analyses = await readAnalyses();
  const filtered = analyses.filter((a) => a.id !== id);
  if (filtered.length === analyses.length) return false;
  await writeAnalyses(filtered);
  return true;
}