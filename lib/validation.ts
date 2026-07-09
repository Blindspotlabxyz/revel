import { z } from "zod";
import { assertPublicHttpUrl } from "@/lib/security/ssrf";

export const urlSchema = z
  .string()
  .min(1, "Please enter a website URL")
  .transform((val) => {
    const trimmed = val.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  })
  .pipe(z.string().url("Please enter a valid website URL"));

export function normalizeUrl(url: string): string {
  return urlSchema.parse(url);
}

/** Normalize format and block SSRF targets (private IPs, metadata, etc.). */
export async function normalizeUrlSafe(url: string): Promise<string> {
  return assertPublicHttpUrl(normalizeUrl(url));
}