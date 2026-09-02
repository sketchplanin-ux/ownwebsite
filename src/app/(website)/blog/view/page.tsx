import type { Metadata } from "next"
import { Suspense } from "react"

import { LoadingState } from "@/components/common/loading-state"
import { BlogDetail } from "@/features/blogs/blog-detail"

export const metadata: Metadata = {
  title: "Journal article",
  description: "Read a published architecture and design article from SKETCHPLAN.",
  alternates: { canonical: "/blog/view/" },
  openGraph: {
    title: "Journal article | SKETCHPLAN",
    description: "Architecture and design insights from SKETCHPLAN.",
    url: "/blog/view/",
    type: "article",
  },
}

export default function BlogViewPage() {
  return (
    <section className="px-6 py-14 sm:py-20" aria-label="Journal article">
      <Suspense
        fallback={<LoadingState variant="page" message="Loading article…" />}
      >
        <BlogDetail />
      </Suspense>
    </section>
  )
}
