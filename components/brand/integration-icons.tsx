import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
};

export function LinearIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M2.886 4.655A2.88 2.88 0 0 0 2 6.883v10.234a2.88 2.88 0 0 0 .886 2.228l7.39 5.684a2.88 2.88 0 0 0 3.448 0l7.39-5.684A2.88 2.88 0 0 0 22 17.117V6.883a2.88 2.88 0 0 0-.886-2.228L13.724.97a2.88 2.88 0 0 0-3.448 0L2.886 4.655ZM4 8.317l7.724 5.957a2.88 2.88 0 0 0 3.448 0L21 8.317V6.883L13.276 12.84a2.88 2.88 0 0 1-3.448 0L4 6.883v1.434Z" />
    </svg>
  );
}

export function NotionIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337 2.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l-1.214 1.027s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.84l1.635-1.075V9.272l-.14-.093c-.093-.42.14-.793.514-.793l3.456-.233 4.856 7.279v-6.44l-.186-.14c-.233-.14-.14-.42.047-.56l1.075-.793z" />
    </svg>
  );
}

export function GitHubGistIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.52 11.52 0 0 1 12 5.845c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

type IntegrationIconBadgeProps = {
  children: ReactNode;
  tint: string;
  className?: string;
};

export function IntegrationIconBadge({
  children,
  tint,
  className,
}: IntegrationIconBadgeProps) {
  return (
    <span
      className={cn(
        "mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
        tint,
        className
      )}
    >
      {children}
    </span>
  );
}