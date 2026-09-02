"use client";

import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { usePublishedServiceBySlug } from "@/features/services/hooks";
import { normalizePublicServiceSlug } from "@/features/services/repository";
import { ServiceDetail } from "@/features/services/service-detail";
import { PUBLIC_ROUTES } from "@/lib/constants";

export function ServiceDetailPage() {
  const searchParams = useSearchParams();
  const slug = normalizePublicServiceSlug(searchParams.get("slug"));
  const serviceQuery = usePublishedServiceBySlug(slug);

  if (!slug) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:px-8 lg:py-28">
        <EmptyState
          icon={<SearchXIcon />}
          title="Choose a service"
          description="This link does not include a valid service. Browse the published services to continue."
          action={
            <Button asChild>
              <Link href={PUBLIC_ROUTES.services}>Browse services</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (serviceQuery.isPending) {
    return (
      <LoadingState
        variant="page"
        message="Loading service"
        description="Retrieving the selected published service."
      />
    );
  }

  if (serviceQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:px-8 lg:py-28">
        <ErrorState
          title="This service could not be loaded"
          description={serviceQuery.error.message}
          onRetry={() => void serviceQuery.refetch()}
          action={
            <Button asChild variant="ghost">
              <Link href={PUBLIC_ROUTES.services}>Back to services</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!serviceQuery.data) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:px-8 lg:py-28">
        <EmptyState
          icon={<SearchXIcon />}
          title="Service not found"
          description="The service may be unavailable or no longer published."
          action={
            <Button asChild>
              <Link href={PUBLIC_ROUTES.services}>Browse services</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <ServiceDetail service={serviceQuery.data} />;
}
