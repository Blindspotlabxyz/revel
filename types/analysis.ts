export type Priority = "critical" | "high" | "medium" | "low";
export type Category = "product" | "ux" | "messaging" | "competition";
export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";
export type Impact = "high" | "medium" | "low";

export interface Blindspot {
  id: string;
  title: string;
  priority: Priority;
  category: Category;
  description: string;
  suggestedFix: string;
}

export interface BlueprintStep {
  id: string;
  step: number;
  title: string;
  estimatedEffort: string;
  expectedImpact: Impact;
  description: string;
}

export interface ActionTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  estimatedEffort: string;
  expectedOutcome: string;
}

export interface AnalysisReport {
  score: number;
  summary: string;
  blindspots: Blindspot[];
  blueprint: BlueprintStep[];
  actions: ActionTask[];
}

export interface Analysis {
  id: string;
  userId?: string;
  website: string;
  status: AnalysisStatus;
  score?: number;
  createdAt: string;
  report?: AnalysisReport;
  error?: string;
}

export type AnalysisStage =
  | "product"
  | "ux"
  | "messaging"
  | "competitors"
  | "blueprint";

export interface AnalysisProgress {
  stages: {
    id: AnalysisStage;
    label: string;
    status: "pending" | "active" | "completed";
  }[];
}