"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { PageHeading } from "@/components/common/page-heading";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdminService, useUpdateAdminService } from "@/features/admin-services/hooks";
import { isSafeDocumentId } from "@/features/admin-services/repository";
import { ServiceForm } from "@/features/admin-services/service-form";
import { useAdmin } from "@/hooks/use-admin";
import { ADMIN_ROUTES } from "@/lib/constants";
import type { ServiceInput } from "@/types/service";

export function ServiceEditScreen() {
  const admin = useAdmin();
  const router = useRouter();
  const serviceId = useSearchParams().get("id")?.trim() ?? "";
  const query = useAdminService(serviceId);
  const mutation = useUpdateAdminService();

  if (!admin.can(PERMISSIONS.MANAGE_SERVICES)) {
    return <ErrorState title="Service access denied" description="Your role cannot edit services." />;
  }
  if (!isSafeDocumentId(serviceId)) {
    return <ErrorState title="Invalid service link" description="Return to Services and choose an item to edit." />;
  }
  if (query.isPending) {
    return <LoadingState variant="page" message="Loading service…" />;
  }
  if (query.isError) {
    return <ErrorState title="Service unavailable" description={query.error.message} onRetry={() => void query.refetch()} />;
  }
  if (!query.data) {
    return <ErrorState title="Service not found" description="This service may have been removed." />;
  }

  const save = async (input: ServiceInput) => {
    try {
      await mutation.mutateAsync({ serviceId, input });
      router.push(ADMIN_ROUTES.services);
    } catch {
      // The controlled mutation error is rendered by the form.
    }
  };

  return (
    <div className="space-y-7">
      <PageHeading eyebrow="Services" title={`Edit ${query.data.title}`} description="Changes become available to public readers after this service is published." />
      <ServiceForm initialService={query.data} submitLabel="Save changes" isPending={mutation.isPending} error={mutation.error} onSubmit={save} />
    </div>
  );
}
