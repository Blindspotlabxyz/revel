"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FORM_SUBMIT_CTA, FORM_SUBMIT_LOADING } from "@/lib/cta";

type AnalysisFormProps = {
  weeklyLimit?: number;
};

export function AnalysisForm({ weeklyLimit = 3 }: AnalysisFormProps) {
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
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Public pages only. Revel fetches the URL you submit to generate your
          report. We do not sell your data or store private keys.{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy policy
          </Link>
        </p>
      </div>

      {error ? <p className="text-sm text-primary">{error}</p> : null}

      <Button type="submit" size="lg" disabled={loading || !url.trim()}>
        {loading ? FORM_SUBMIT_LOADING : FORM_SUBMIT_CTA}
      </Button>

      <p className="text-xs text-muted">
        Free early access: up to {weeklyLimit} audits per week (resets Monday
        00:00 UTC). Need more? OKX.AI marketplace at $0.35 per successful audit.{" "}
        <Link href="/pricing" className="text-primary hover:underline">
          Access details
        </Link>
      </p>
    </form>
  );
}
