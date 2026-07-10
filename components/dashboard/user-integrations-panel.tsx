"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { IntegrationStatus } from "@/lib/integrations/types";

const PROVIDER_COPY: Record<
  string,
  { title: string; blurb: string; connectLabel: string }
> = {
  linear: {
    title: "Linear",
    blurb:
      "Creates issues in your Linear team from the Action Queue. Only your workspace can see them.",
    connectLabel: "Connect Linear",
  },
  notion: {
    title: "Notion",
    blurb:
      "Creates a Blueprint page in your Notion workspace. Private unless you share the page.",
    connectLabel: "Connect Notion",
  },
  github: {
    title: "GitHub Gist",
    blurb:
      "Creates a private Gist under your GitHub account. Only you can see it unless you share the link.",
    connectLabel: "Connect GitHub",
  },
};

export function UserIntegrationsPanel() {
  const [items, setItems] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load integrations");
        setItems([]);
        return;
      }
      setItems(data.integrations ?? []);
      setError(null);
    } catch {
      setError("Could not load integrations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const err = params.get("error");
    if (connected) {
      setMessage(`${connected} connected. Exports will use your account only.`);
    }
    if (err) {
      setError(decodeURIComponent(err));
    }
    if (connected || err) {
      window.history.replaceState({}, "", "/mission-control/integrations");
    }
  }, []);

  async function disconnect(provider: string) {
    setBusy(provider);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/integrations/${provider}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not disconnect");
        return;
      }
      setMessage(`${provider} disconnected.`);
      await load();
    } catch {
      setError("Could not disconnect");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-heading text-lg font-semibold">Your connections</h2>
        <p className="mt-2 text-sm text-muted">
          Connect <strong className="text-foreground">your</strong> Linear,
          Notion, and GitHub. Exports go to your accounts — other Revel users
          cannot see them. Markdown and JSON downloads never leave your browser
          session.
        </p>
        {message ? (
          <p className="mt-3 text-sm text-primary">{message}</p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading connections…</p>
      ) : (
        items.map((item) => {
          const copy = PROVIDER_COPY[item.provider];
          return (
            <Card key={item.provider} id={item.provider}>
              <CardContent className="pt-0">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{copy.title}</CardTitle>
                    <p className="mt-2 max-w-xl text-sm text-muted">
                      {copy.blurb}
                    </p>
                    {item.connected && item.label ? (
                      <p className="mt-2 text-sm text-foreground">
                        Connected as{" "}
                        <span className="font-medium">{item.label}</span>
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      item.connected
                        ? "bg-primary/10 text-primary"
                        : "bg-background text-muted"
                    }`}
                  >
                    {item.connected ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Connected
                      </>
                    ) : (
                      "Not connected"
                    )}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.connected ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy === item.provider}
                      onClick={() => disconnect(item.provider)}
                    >
                      <Unplug className="mr-2 h-4 w-4" />
                      {busy === item.provider ? "Disconnecting…" : "Disconnect"}
                    </Button>
                  ) : item.oauthConfigured ? (
                    <Button asChild size="sm">
                      <a href={`/api/integrations/${item.provider}/start`}>
                        {copy.connectLabel}
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : (
                    <p className="text-sm text-muted">
                      OAuth is not configured on the server yet. Ask the site
                      admin to add {item.provider} client credentials.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      <p className="text-sm text-muted">
        After connecting, open any{" "}
        <Link href="/mission-control" className="text-primary hover:underline">
          report
        </Link>{" "}
        and use Export Blueprint.
      </p>
    </div>
  );
}
