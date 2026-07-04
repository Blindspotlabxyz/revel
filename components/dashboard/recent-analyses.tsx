"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface HistoryItem {
  id: string;
  website: string;
  status: string;
  score?: number;
  createdAt: string;
}

export function RecentAnalyses() {
  const [analyses, setAnalyses] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setAnalyses(data.slice(0, 5)))
      .catch(() => setAnalyses([]));
  }, []);

  if (analyses.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="font-heading text-xl font-semibold">Recent Analyses</h2>
      <p className="mt-1 text-sm text-muted">Last 5 reports</p>

      <div className="mt-6 space-y-3">
        {analyses.map((item) => (
          <Card key={item.id} className="hover:-translate-y-0.5">
            <CardContent className="flex items-center justify-between pt-0">
              <div>
                <CardTitle className="text-base">{item.website}</CardTitle>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(item.createdAt)}
                  {item.score !== undefined && ` · Score: ${item.score}`}
                </p>
              </div>
              {item.status === "completed" && (
                <Link
                  href={`/mission-control/report/${item.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View Report
                </Link>
              )}
              {item.status === "processing" && (
                <Link
                  href={`/mission-control/analysis/${item.id}`}
                  className="text-sm font-medium text-muted"
                >
                  In progress...
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}