"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";

const DESKTOP_MQ = "(min-width: 48rem)";
const DESKTOP_SIZES = "(max-width: 47.99rem) 0px, 50vw";

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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const frameStyle = {
    ["--illustration-mobile-bg" as string]: `url("${mobileSrc}")`,
  } as CSSProperties;

  return (
    <div className="illustration-frame" style={frameStyle}>
      <div className="illustration-frame__media relative">
        {isDesktop ? (
          <Image
            src={desktopSrc}
            alt={alt}
            fill
            sizes={DESKTOP_SIZES}
            priority={priority}
            className="object-contain"
          />
        ) : (
          <span className="sr-only">{alt}</span>
        )}
      </div>
    </div>
  );
}
