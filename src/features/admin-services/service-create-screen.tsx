"use client";

import { useRouter } from "next/navigation";

import { ErrorState } from "@/components/common/error-state";
import { PageHeading } from "@/components/common/page-heading";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useCreateAdminService } from "@/features/admin-services/hooks";
import { ServiceForm } from "@/features/admin-services/service-form";
import { useAdmin } from "@/hooks/use-admin";
import { ADMIN_ROUTES } from "@/lib/constants";
import type { ServiceInput } from "@/types/service";

export function ServiceCreateScreen() {
  const admin = useAdmin();
  const router = useRouter();
  const mutation = useCreateAdminService();

  if (!admin.can(PERMISSIONS.MANAGE_SERVICES)) {
    return <ErrorState title="Service access denied" description="Your role cannot create services." />;
  }

  const save = async (input: ServiceInput) => {
    try {
      await mutation.mutateAsync(input);
      router.push(ADMIN_ROUTES.services);
    } catch {
      // The controlled mutation error is rendered by the form.
    }
  };

  return (
    <div className="space-y-7">
      <PageHeading eyebrow="Services" title="Create service" description="Prepare the public service detail, image, ordering, and search metadata." />
      <ServiceForm submitLabel="Create service" isPending={mutation.isPending} error={mutation.error} onSubmit={save} />
    </div>
  );
}
