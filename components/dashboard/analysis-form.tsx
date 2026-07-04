"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AnalysisForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      router.push(`/mission-control/analysis/${data.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't analyze this website right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="mb-2 block text-sm font-medium">
          Website URL
        </label>
        <Input
          id="url"
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-sm text-primary">{error}</p>
      )}

      <Button type="submit" size="lg" disabled={loading || !url.trim()}>
        {loading ? "Starting..." : "Analyze Product"}
      </Button>
    </form>
  );
}