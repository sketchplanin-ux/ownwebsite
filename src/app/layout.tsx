import type { Metadata } from "next";

import { JsonLd } from "@/components/website/json-ld";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const siteName = "SKETCHPLAN";
const siteTitle = "SKETCHPLAN | Architecture, Interior & Planning";
const siteDescription =
  "Thoughtful architecture, interior design, and spatial planning by SKETCHPLAN, shaped with clarity, purpose, and enduring detail.";
const siteUrl = new URL(
  process.env.SITE_URL?.trim() || "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "architecture",
    "interior design",
    "spatial planning",
    "residential architecture",
    "commercial architecture",
    "architectural planning",
    siteName,
  ],
  authors: [{ name: siteName, url: "/" }],
  creator: siteName,
  publisher: siteName,
  category: "architecture and design",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": new URL("/#organization", siteUrl).toString(),
  name: siteName,
  url: siteUrl.toString(),
  description: siteDescription,
  knowsAbout: ["Architecture", "Interior design", "Spatial planning"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <JsonLd data={organizationSchema} />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
