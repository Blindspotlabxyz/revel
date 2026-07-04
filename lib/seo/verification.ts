import type { Metadata } from "next";

/** Search Console / Webmaster verification meta tags from env */
export function searchVerificationMetadata(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION;
  const yandex = process.env.YANDEX_SITE_VERIFICATION;

  if (!google && !bing && !yandex) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(yandex ? { yandex } : {}),
    other: {
      ...(bing ? { "msvalidate.01": bing } : {}),
    },
  };
}