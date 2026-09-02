import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/common/loading-state";
import { BannerEditScreen } from "@/features/admin-banners/banner-edit-screen";

export const metadata: Metadata = {
  title: "Edit Banner",
};

export default function AdminBannerEditPage() {
  return (
    <Suspense fallback={<LoadingState variant="page" message="Opening banner editor…" />}>
      <BannerEditScreen />
    </Suspense>
  );
}
