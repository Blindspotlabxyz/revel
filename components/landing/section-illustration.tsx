"use client";

import Image from "next/image";

/** Shared image sizes: hero column on desktop, full width on mobile. */
const DESKTOP_SIZES = "(max-width: 47.99rem) 0px, 50vw";
const MOBILE_SIZES = "(max-width: 47.99rem) 100vw, 0px";

interface SectionIllustrationProps {
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
  priority?: boolean;
}

export function SectionIllustration({
  desktopSrc,
  mobileSrc,
  alt,
  priority = false,
}: SectionIllustrationProps) {
  return (
    <div className="illustration-frame">
      <div className="illustration-frame__media relative">
        {/* Desktop: 16:9 asset, visible md+ */}
        <Image
          src={desktopSrc}
          alt={alt}
          fill
          sizes={DESKTOP_SIZES}
          priority={priority}
          className="hidden object-contain md:block"
        />
        {/* Mobile: 9:16 asset, visible below md */}
        <Image
          src={mobileSrc}
          alt={alt}
          fill
          sizes={MOBILE_SIZES}
          priority={priority}
          className="object-contain md:hidden"
        />
      </div>
    </div>
  );
}