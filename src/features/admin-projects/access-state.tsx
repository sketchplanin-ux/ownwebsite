"use client";

import { ShieldAlert } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";

export function AdminProjectsAccessLoading() {
  return (
    <LoadingState
      variant="page"
      message="Checking project permissions…"
    />
  );
}

export function AdminProjectsAccessDenied() {
  return (
    <ErrorState
      title="Project access denied"
      description="Your administrator role does not include permission to manage projects."
      action={
        <span aria-hidden="true" className="sr-only">
          <ShieldAlert />
        </span>
      }
    />
  );
}
