"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface HistoryItem {
  id: string;
  website: string;
  status: string;
  score?: number;
  createdAt: string;
}

export function HistoryPage() {
  const [analyses, setAnalyses] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then(setAnalyses)
      .catch(() => setAnalyses([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await fetch("/api/history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return <p className="text-muted">Loading history...</p>;
  }

  if (analyses.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          You haven&apos;t analyzed a product yet.
        </h1>
        <p className="mt-2 text-muted">
          Paste a website to get started.
        </p>
        <Button asChild className="mt-6">
          <Link href="/mission-control">Run First Analysis</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold">History</h1>
      <p className="mt-2 text-muted">Your previous analyses.</p>

      <div className="mt-8 space-y-3">
        {analyses.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-0">
              <div>
                <CardTitle className="text-base">{item.website}</CardTitle>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(item.createdAt)}
                  {item.score !== undefined && ` · Reveal Index: ${item.score}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {item.status === "completed" && (
                  <Link
                    href={`/mission-control/report/${item.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Report
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-sm text-muted hover:text-primary"
                >
                  Delete
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}