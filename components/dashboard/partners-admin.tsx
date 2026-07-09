"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PartnerRecord } from "@/lib/partners";

type PartnersAdminProps = {
  initialPartners: PartnerRecord[];
};

export function PartnersAdmin({ initialPartners }: PartnersAdminProps) {
  const router = useRouter();
  const [partners, setPartners] = useState(initialPartners);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    domain: "",
    contactEmail: "",
    accessType: "whitelisted" as "paid" | "whitelisted" | "trial",
  });

  async function refresh() {
    const res = await fetch("/api/admin/partners");
    const data = await res.json();
    if (res.ok) setPartners(data.partners);
  }

  async function createPartner(issueKey: boolean) {
    setLoading(true);
    setError("");
    setNewKey(null);
    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partner: form, issueKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.apiKey) setNewKey(data.apiKey);
      setForm({ name: "", domain: "", contactEmail: "", accessType: "whitelisted" });
      await refresh();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function updatePartner(
    id: string,
    patch: Record<string, string | number | null>
  ) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      await refresh();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  async function issueKey(id: string, revokeExisting = false) {
    setLoading(true);
    setError("");
    setNewKey(null);
    try {
      const res = await fetch(`/api/admin/partners/${id}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revokeExisting, label: "admin-issued" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Key issue failed");
      setNewKey(data.apiKey);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Key issue failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {newKey ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-0">
            <CardTitle>New API key (copy now)</CardTitle>
            <p className="mt-2 font-mono text-sm break-all">{newKey}</p>
            <p className="mt-2 text-xs text-muted">
              This key is shown once. Add to partner env as REVEL_PARTNER_API_KEY.
            </p>
            <Button className="mt-4" size="sm" onClick={() => setNewKey(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {error ? <p className="text-sm text-primary">{error}</p> : null}

      <Card>
        <CardContent className="pt-0">
          <CardTitle>Add partner</CardTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Platform name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Domain (arcapush.com)"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
            />
            <Input
              placeholder="Contact email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            />
            <select
              className="h-12 rounded-lg border border-border bg-surface px-4 text-sm"
              value={form.accessType}
              onChange={(e) =>
                setForm({
                  ...form,
                  accessType: e.target.value as "paid" | "whitelisted" | "trial",
                })
              }
            >
              <option value="whitelisted">Whitelisted (free)</option>
              <option value="paid">Paid (credits)</option>
              <option value="trial">Trial</option>
            </select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={loading || !form.name} onClick={() => createPartner(false)}>
              Create
            </Button>
            <Button
              disabled={loading || !form.name}
              variant="secondary"
              onClick={() => createPartner(true)}
            >
              Create + issue key
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {partners.map((partner) => (
          <Card key={partner.id}>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle>{partner.name}</CardTitle>
                  <p className="mt-1 text-sm text-muted">
                    {partner.domain ?? "no domain"} · {partner.contactEmail ?? "—"}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {partner.accessType} · {partner.status} · {partner.creditsBalance}{" "}
                    credits · {partner.analysisCount} audits · {partner.apiKeyCount} keys
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {partner.status !== "active" ? (
                    <Button
                      size="sm"
                      disabled={loading}
                      onClick={() => updatePartner(partner.id, { status: "active" })}
                    >
                      Approve
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={loading}
                    onClick={() => issueKey(partner.id)}
                  >
                    Issue key
                  </Button>
                  {partner.accessType !== "whitelisted" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={loading}
                      onClick={() =>
                        updatePartner(partner.id, {
                          accessType: "whitelisted",
                          status: "active",
                        })
                      }
                    >
                      Whitelist
                    </Button>
                  ) : null}
                </div>
              </div>
              {partner.notes ? (
                <p className="mt-3 text-xs text-muted">{partner.notes}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}