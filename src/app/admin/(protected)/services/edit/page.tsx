import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/common/loading-state";
import { ServiceEditScreen } from "@/features/admin-services/service-edit-screen";

export const metadata: Metadata = {
  title: "Edit service",
}

export default function EditAdminServicePage() {
  return (
    <Suspense
      fallback={<LoadingState variant="page" message="Loading service editor…" />}
    >
      <ServiceEditScreen />
    </Suspense>
  )
}
