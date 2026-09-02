import type { Metadata } from "next";

import { ProjectsList } from "@/features/projects";

const title = "Architecture and interior projects";
const description =
  "Browse SKETCHPLAN's published portfolio of residential, commercial, interior, renovation, and planning projects.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/projects/",
  },
  openGraph: {
    type: "website",
    url: "/projects/",
    title: `${title} | SKETCHPLAN`,
    description,
  },
  twitter: {
    card: "summary",
    title: `${title} | SKETCHPLAN`,
    description,
  },
};

export default function ProjectsPage() {
  return (
    <>
      <header className="border-b bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
            Portfolio
          </p>
          <h1 className="mt-4 max-w-4xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Spaces designed with purpose and lasting character
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
            Explore selected architecture, interior, planning, and renovation
            work, ordered and published directly by the SKETCHPLAN team.
          </p>
        </div>
      </header>

      <section
        aria-labelledby="published-projects-heading"
        className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24"
      >
        <h2 id="published-projects-heading" className="sr-only">
          Published projects
        </h2>
        <ProjectsList />
      </section>
    </>
  );
}
