import type { Metadata } from "next";

import { ServicesList } from "@/features/services";

const title = "Architecture and design services";
const description =
  "Explore SKETCHPLAN services for architecture, interior design, building planning, renovation, and considered spatial design.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/services/",
  },
  openGraph: {
    type: "website",
    url: "/services/",
    title: `${title} | SKETCHPLAN`,
    description,
  },
  twitter: {
    card: "summary",
    title: `${title} | SKETCHPLAN`,
    description,
  },
};

export default function ServicesPage() {
  return (
    <>
      <header className="border-b bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
            Services
          </p>
          <h1 className="mt-4 max-w-4xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Design expertise, shaped around your project
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
            From first ideas to resolved spaces, our services bring architectural
            thinking, practical planning, and close attention to detail together.
          </p>
        </div>
      </header>

      <section
        aria-labelledby="published-services-heading"
        className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24"
      >
        <h2 id="published-services-heading" className="sr-only">
          Published services
        </h2>
        <ServicesList />
      </section>
    </>
  );
}
