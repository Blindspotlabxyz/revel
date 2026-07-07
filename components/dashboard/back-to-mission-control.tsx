import Link from "next/link";

export function BackToMissionControl() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-6">
      <Link
        href="/mission-control"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to Mission Control
      </Link>
    </div>
  );
}