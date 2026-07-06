"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ReportOverview } from "./report-overview";
import { BlindspotMap } from "./blindspot-map";
import { Blueprint } from "./blueprint";
import { ActionQueue } from "./action-queue";
import { ExportPanel } from "./export-panel";
import type { AnalysisReport } from "@/types/analysis";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "blindspots", label: "Blindspot Map™" },
  { id: "blueprint", label: "Blueprint™" },
  { id: "actions", label: "Action Queue™" },
] as const;

interface ReportTabsProps {
  report: AnalysisReport;
  analysisId: string;
  website: string;
}

export function ReportTabs({ report, analysisId, website }: ReportTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <div>
      <div className="mb-2">
        <p className="text-sm text-muted">{website}</p>
        <p className="mt-4 max-w-2xl text-muted leading-relaxed">
          {report.summary}
        </p>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "whitespace-nowrap px-4 py-3 text-sm transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary font-medium text-foreground"
                : "text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
        {activeTab === "overview" && <ReportOverview report={report} />}
        {activeTab === "blindspots" && (
          <BlindspotMap blindspots={report.blindspots} />
        )}
        {activeTab === "blueprint" && <Blueprint steps={report.blueprint} />}
        {activeTab === "actions" && (
          <ActionQueue actions={report.actions} />
        )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <ExportPanel analysisId={analysisId} />
        </aside>
      </div>
    </div>
  );
}