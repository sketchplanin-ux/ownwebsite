import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/common/loading-state";
import { OfferEditScreen } from "@/features/admin-offers/offer-edit-screen";

export const metadata: Metadata = {
  title: "Edit Offer",
};

export default function AdminOfferEditPage() {
  return (
    <Suspense fallback={<LoadingState variant="page" message="Opening offer editor…" />}>
      <OfferEditScreen />
    </Suspense>
  );
}
