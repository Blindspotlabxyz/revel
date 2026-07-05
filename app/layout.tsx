import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Analytics } from "@/components/analytics";
import { GlobalJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/site-config";
import { seoKeywords } from "@/lib/seo/keywords";
import { searchVerificationMetadata } from "@/lib/seo/verification";

import "@/styles/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...seoKeywords],
  applicationName: siteConfig.name,
  category: "productivity",
  creator: siteConfig.organization.name,
  publisher: siteConfig.organization.name,
  authors: [{ name: siteConfig.founder.name, url: siteConfig.founder.url }],
  alternates: {
    types: {
      "text/plain": [
        { url: "/llms.txt", title: "LLMs.txt" },
        { url: "/llms-full.txt", title: "LLMs full context" },
        { url: "/ai.txt", title: "AI discovery" },
      ],
    },
  },
  metadataBase: new URL(siteConfig.url),
  verification: searchVerificationMetadata(),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Revel",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
        <body className="min-h-screen antialiased">
          <GlobalJsonLd />
          {children}
          <Analytics />
        </body>
      </html>
    </Providers>
  );
}