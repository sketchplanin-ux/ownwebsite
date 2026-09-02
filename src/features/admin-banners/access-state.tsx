"use client";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";

export function AdminBannersAccessLoading() {
  return (
    <LoadingState variant="page" message="Checking banner permissions…" />
  );
}

export function AdminBannersAccessDenied() {
  return (
    <ErrorState
      title="Banner access denied"
      description="Your administrator role does not include permission to manage banners."
    />
  );
}
