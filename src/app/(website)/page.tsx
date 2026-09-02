import type { Metadata } from "next";

import { HomePageClient } from "@/features/home/home-page-client";

const title = "SKETCHPLAN | Architecture, Interior & Planning";
const description =
  "Explore SKETCHPLAN architecture, interior design, planning services, selected projects, studio articles, and current updates.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
