import type { Metadata } from "next";

import { AboutPageClient } from "@/features/home/about-page-client";

const title = "About SKETCHPLAN | Architecture, Interior & Planning";
const description =
  "Learn about SKETCHPLAN's connected approach to architecture, interior design, planning, studio process, and team contacts.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/about/" },
  openGraph: {
    title,
    description,
    url: "/about/",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
