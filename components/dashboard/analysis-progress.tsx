"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { id: "product", label: "Product Analysis" },
  { id: "ux", label: "UX Review" },
  { id: "messaging", label: "Messaging Review" },
  { id: "competitors", label: "Competitor Review" },
  { id: "blueprint", label: "Generating Blueprint" },
];

interface AnalysisProgressProps {
  analysisId: string;
}

export function AnalysisProgress({ analysisId }: AnalysisProgressProps) {
  const [completedStages, setCompletedStages] = useState(0);
  const [status, setStatus] = useState<"processing" | "completed" | "failed">(
    "processing"
  );
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCompletedStages((prev) => {
        if (prev < stages.length - 1) return prev + 1;
        return prev;
      });
    }, 8000);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/report/${analysisId}`);
        const data = await res.json();

        if (data.status === "completed") {
          setCompletedStages(stages.length);
          setStatus("completed");
          clearInterval(stageInterval);
          clearInterval(pollInterval);
          setTimeout(() => {
            router.push(`/mission-control/report/${analysisId}`);
          }, 600);
        } else if (data.status === "failed") {
          setStatus("failed");
          setFailureReason(
            typeof data.error === "string"
              ? data.error
              : "Analysis failed unexpectedly"
          );
          clearInterval(stageInterval);
          clearInterval(pollInterval);
        }
      } catch {
        // continue polling
      }
    }, 2000);

    return () => {
      clearInterval(stageInterval);
      clearInterval(pollInterval);
    };
  }, [analysisId, router]);

  if (status === "failed") {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="text-lg">
          We couldn&apos;t analyze this website right now.
        </p>
        <p className="mt-2 text-muted">
          Please try again in a moment.
        </p>
        {failureReason ? (
          <p className="mt-4 rounded-lg bg-background px-4 py-3 text-left text-sm text-muted">
            {failureReason}
          </p>
        ) : null}
        <a
          href="/mission-control"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Try again
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-8">
      <h2 className="font-heading text-xl font-semibold">Analyzing...</h2>
      <p className="mt-2 text-sm text-muted">
        Estimated time: 30–60 seconds
      </p>

      <div className="mt-8 space-y-4">
        {stages.map((stage, i) => {
          const isCompleted = i < completedStages;
          const isActive = i === completedStages && status === "processing";

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  isCompleted && "bg-primary/10 text-primary",
                  isActive && "text-primary",
                  !isCompleted && !isActive && "text-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-border" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm",
                  isCompleted && "text-foreground",
                  isActive && "font-medium text-foreground",
                  !isCompleted && !isActive && "text-muted"
                )}
              >
                {stage.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}