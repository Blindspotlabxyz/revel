"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PartnerApplyForm() {
  const [form, setForm] = useState({
    name: "",
    domain: "",
    contactEmail: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application failed");
      setMessage(data.message);
      setForm({ name: "", domain: "", contactEmail: "", notes: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Application failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        required
        placeholder="Platform / company name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        placeholder="Your domain (e.g. arcapush.com)"
        value={form.domain}
        onChange={(e) => setForm({ ...form, domain: e.target.value })}
      />
      <Input
        required
        type="email"
        placeholder="Contact email"
        value={form.contactEmail}
        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
      />
      <Input
        placeholder="How will you use Revel? (optional)"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      {message ? <p className="text-sm text-muted">{message}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting…" : "Request partner access"}
      </Button>
    </form>
  );
}