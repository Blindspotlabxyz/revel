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
  href?: string;
  showText?: boolean;
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
      <rect x="10" y="14" width="38" height="38" rx="9" fill="#0A0F1C" />
      <path d="M38 14h14v14c-6-4-10-6-14-8V14z" fill="#F3F5F8" />
      <path d="M38 14h14v14l-9-5.5C41 20.5 39 17.5 38 14z" fill="#3559E0" />
      <path
        d="M38 14l14 14"
        stroke="#2A47C4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="30" cy="36" r="3" fill="#3559E0" opacity="0.95" />
    </svg>
  );
}

export function RevelLogo({
  variant = "wordmark",
  size = "md",
  className,
  href = "/",
  showText = true,
}: RevelLogoProps) {
  const px = iconSizes[size];
  const isIconOnly = variant === "icon" || !showText;

  const content = isIconOnly ? (
    <RevelIcon size={px} />
  ) : (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <RevelIcon size={px} />
      <span className="font-heading text-lg font-bold tracking-tight text-foreground">
        Revel
      </span>
    </span>
  );

  if (!href) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md",
        className
      )}
      aria-label="Revel home"
    >
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
