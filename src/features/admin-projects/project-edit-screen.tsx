"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { ADMIN_ROUTES } from "@/lib/constants";

import {
  AdminProjectsAccessDenied,
  AdminProjectsAccessLoading,
} from "./access-state";
import { useAdminProject, useAdminProjectCategories } from "./hooks";
import { ProjectForm } from "./project-form";

export function ProjectEditScreen() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id")?.trim() ?? "";
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_PROJECTS);
  const projectQuery = useAdminProject(projectId, canManage && Boolean(projectId));
  const categoriesQuery = useAdminProjectCategories(canManage);

  if (admin.isLoading) {
    return <AdminProjectsAccessLoading />;
  }
  if (!canManage) {
    return <AdminProjectsAccessDenied />;
  }
  if (!projectId) {
    return (
      <EmptyState
        title="No project selected"
        description="Open a project from the project list to edit it."
        action={
          <Button asChild variant="outline">
            <Link href={ADMIN_ROUTES.projects}>
              <ArrowLeft aria-hidden="true" />
              Back to projects
            </Link>
          </Button>
        }
      />
    );
  }
  if (projectQuery.isPending || categoriesQuery.isPending) {
    return <LoadingState variant="page" message="Loading project editor…" />;
  }
  if (projectQuery.isError || categoriesQuery.isError) {
    const error = projectQuery.error ?? categoriesQuery.error;
    return (
      <ErrorState
        title="Project editor unavailable"
        description={error?.message}
        onRetry={() => {
          void projectQuery.refetch();
          void categoriesQuery.refetch();
        }}
      />
    );
  }
  if (!projectQuery.data) {
    return (
      <EmptyState
        title="Project not found"
        description="This project may have been deleted or the link may be invalid."
        action={
          <Button asChild variant="outline">
            <Link href={ADMIN_ROUTES.projects}>
              <ArrowLeft aria-hidden="true" />
              Back to projects
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <ProjectForm
      key={projectQuery.data.id}
      initialProject={projectQuery.data}
      categories={categoriesQuery.data}
    />
  );
}
