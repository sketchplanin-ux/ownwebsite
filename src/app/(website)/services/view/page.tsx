import { Suspense } from "react";
import type { Metadata } from "next";

import { LoadingState } from "@/components/common/loading-state";
import { ServiceDetailPage } from "@/features/services";

const title = "Service details";
const description =
  "Explore the scope, features, and approach of a published SKETCHPLAN architecture or design service.";

// Firestore content is resolved in the browser for this static export, so this
// route intentionally uses honest, fixed metadata rather than a fabricated
// service-specific title.
export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/services/view/",
  },
  openGraph: {
    type: "website",
    url: "/services/view/",
    title: `${title} | SKETCHPLAN`,
    description,
  },
  twitter: {
    card: "summary",
    title: `${title} | SKETCHPLAN`,
    description,
  },
};

export default function ServiceViewPage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          variant="page"
          message="Loading service"
          description="Preparing the selected published service."
        />
      }
    >
      <ServiceDetailPage />
    </Suspense>
  );
}
