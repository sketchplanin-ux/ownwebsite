"use client";

import { ShieldAlert } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";

export function AdminBlogsAccessLoading() {
  return <LoadingState variant="page" message="Checking blog permissions…" />;
}

export function AdminBlogsAccessDenied() {
  return (
    <ErrorState
      title="Blog access denied"
      description="Your administrator role does not include permission to manage blog posts."
      action={
        <span aria-hidden="true" className="sr-only">
          <ShieldAlert />
        </span>
      }
    />
  );
}
