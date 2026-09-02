import type { Metadata } from "next"

import { SectionHeading } from "@/components/website/section-heading"
import { BlogListing } from "@/features/blogs/blog-listing"

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Explore SKETCHPLAN articles about architecture, interior design, materials, and thoughtful planning.",
  alternates: { canonical: "/blog/" },
  openGraph: {
    title: "Journal | SKETCHPLAN",
    description:
      "Architecture, interior design, materials, and planning notes from SKETCHPLAN.",
    url: "/blog/",
    type: "website",
  },
}

export default function BlogPage() {
  return (
    <>
      <section className="border-b bg-muted/30 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            headingLevel={1}
            eyebrow="Journal"
            title="Notes on shaping places"
            description="Ideas from our practice across architecture, interiors, construction, and planning."
          />
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20" aria-label="Published articles">
        <div className="mx-auto max-w-7xl">
          <BlogListing />
        </div>
      </section>
    </>
  )
}
