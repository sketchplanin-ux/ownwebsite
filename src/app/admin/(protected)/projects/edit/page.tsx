import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/common/loading-state";
import { ProjectEditScreen } from "@/features/admin-projects/project-edit-screen";

export const metadata: Metadata = {
  title: "Edit Project",
};

export default function AdminProjectEditPage() {
  return (
    <Suspense
      fallback={<LoadingState variant="page" message="Opening project editor…" />}
    >
      <ProjectEditScreen />
    </Suspense>
  );
}
