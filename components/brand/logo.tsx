import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const iconSizes = {
  sm: 28,
  md: 32,
  lg: 40,
} as const;

type LogoSize = keyof typeof iconSizes;

type RevelLogoProps = {
  variant?: "wordmark" | "icon";
  size?: LogoSize;
  className?: string;
  /**
   * Home target. Relative paths use Next.js <Link>; absolute http(s) URLs use
   * a plain <a> for cross-subdomain navigation (docs/legal → marketing).
   * Pass null/undefined to render without a link.
   */
  href?: string | null;
  /**
   * Force plain <a> even for relative paths. Prefer absolute marketing URL +
   * this for cross-origin; usually auto-detected from href.
   */
  external?: boolean;
  showText?: boolean;
  /** Optional surface label, e.g. "Docs" → Revel / Docs */
  surfaceLabel?: string;
};

function RevelIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect x="10" y="14" width="38" height="38" rx="9" fill="#111111" />
      <path d="M38 14h14v14c-6-4-10-6-14-8V14z" fill="#F7F2EB" />
      <path d="M38 14h14v14l-9-5.5C41 20.5 39 17.5 38 14z" fill="#E07A5F" />
      <path
        d="M38 14l14 14"
        stroke="#C96A52"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="30" cy="36" r="3" fill="#E07A5F" opacity="0.9" />
    </svg>
  );
}

function isAbsoluteHttpUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function RevelLogo({
  variant = "wordmark",
  size = "md",
  className,
  href = "/",
  external,
  showText = true,
  surfaceLabel,
}: RevelLogoProps) {
  const px = iconSizes[size];
  const isIconOnly = variant === "icon" || !showText;
  const useExternalAnchor =
    external === true || (typeof href === "string" && isAbsoluteHttpUrl(href));

  const wordmark = (
    <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
      Revel
    </span>
  );

  const content = isIconOnly ? (
    <RevelIcon size={px} />
  ) : (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <RevelIcon size={px} />
      {surfaceLabel ? (
        <span className="inline-flex items-baseline gap-1.5">
          {wordmark}
          <span className="text-muted" aria-hidden>
            /
          </span>
          <span className="font-body text-sm font-medium text-muted">
            {surfaceLabel}
          </span>
        </span>
      ) : (
        wordmark
      )}
    </span>
  );

  if (!href) {
    return <span className={className}>{content}</span>;
  }

  const linkClass = cn(
    "inline-flex items-center transition-opacity hover:opacity-90",
    className
  );

  if (useExternalAnchor) {
    return (
      <a
        href={href}
        className={linkClass}
        aria-label="Revel home"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClass} aria-label="Revel home">
      {content}
    </Link>
  );
}

/** Static logo image for contexts that need the official SVG asset */
export function RevelLogoImage({
  className,
  width = 120,
  height = 29,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/brand/revel-logo.svg"
      alt="Revel"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
