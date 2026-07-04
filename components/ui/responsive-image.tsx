"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ResponsiveImage({
  desktopSrc,
  mobileSrc,
  alt,
  className,
  priority = false,
}: ResponsiveImageProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Image
        src={desktopSrc}
        alt={alt}
        width={1600}
        height={900}
        priority={priority}
        className="hidden h-auto w-full object-contain md:block"
      />
      <Image
        src={mobileSrc}
        alt={alt}
        width={900}
        height={1600}
        priority={priority}
        className="block h-auto w-full object-contain md:hidden"
      />
    </div>
  );
}