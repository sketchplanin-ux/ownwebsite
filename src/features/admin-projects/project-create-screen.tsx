"use client";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";

import {
  AdminProjectsAccessDenied,
  AdminProjectsAccessLoading,
} from "./access-state";
import { useAdminProjectCategories } from "./hooks";
import { ProjectForm } from "./project-form";

export function ProjectCreateScreen() {
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_PROJECTS);
  const categoriesQuery = useAdminProjectCategories(canManage);

  if (admin.isLoading) {
    return <AdminProjectsAccessLoading />;
  }
  if (!canManage) {
    return <AdminProjectsAccessDenied />;
  }
  if (categoriesQuery.isPending) {
    return <LoadingState variant="page" message="Loading project editor…" />;
  }
  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title="Project editor unavailable"
        description={categoriesQuery.error.message}
        onRetry={() => void categoriesQuery.refetch()}
      />
    );
  }

  return <ProjectForm categories={categoriesQuery.data} />;
}
