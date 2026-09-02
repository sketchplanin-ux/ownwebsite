import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/common/loading-state";
import { ProjectPreviewScreen } from "@/features/admin-projects/project-preview-screen";

export const metadata: Metadata = {
  title: "Project Preview",
};

export default function AdminProjectPreviewPage() {
  return (
    <Suspense
      fallback={<LoadingState variant="page" message="Opening project preview…" />}
    >
      <ProjectPreviewScreen />
    </Suspense>
  );
}
