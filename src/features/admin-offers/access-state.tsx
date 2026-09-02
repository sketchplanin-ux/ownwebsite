"use client";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";

export function AdminOffersAccessLoading() {
  return <LoadingState variant="page" message="Checking offer permissions…" />;
}

export function AdminOffersAccessDenied() {
  return (
    <ErrorState
      title="Offer access denied"
      description="Your administrator role does not include permission to manage offers."
    />
  );
}
