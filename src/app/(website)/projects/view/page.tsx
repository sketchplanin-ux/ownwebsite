import { Suspense } from "react";
import type { Metadata } from "next";

import { LoadingState } from "@/components/common/loading-state";
import { ProjectDetailPage } from "@/features/projects";

const title = "Project details";
const description =
  "View the design overview, project information, and ordered image gallery for a published SKETCHPLAN project.";

// Firestore content is resolved in the browser for this static export, so this
// route intentionally uses honest, fixed metadata rather than a fabricated
// project-specific title.
export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/projects/view/",
  },
  openGraph: {
    type: "website",
    url: "/projects/view/",
    title: `${title} | SKETCHPLAN`,
    description,
  },
  twitter: {
    card: "summary",
    title: `${title} | SKETCHPLAN`,
    description,
  },
};

export default function ProjectViewPage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          variant="page"
          message="Loading project"
          description="Preparing the selected published project."
        />
      }
    >
      <ProjectDetailPage />
    </Suspense>
  );
}
