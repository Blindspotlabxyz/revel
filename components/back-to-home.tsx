import { appUrl } from "@/lib/navigation";

export function BackToHome() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-6">
      <a
        href={appUrl("/")}
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Back to Home
      </a>
    </div>
  );
}