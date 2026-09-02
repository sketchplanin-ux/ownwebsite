"use client";

import { Layers3Icon } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { usePublishedServices } from "@/features/services/hooks";
import { ServiceCard } from "@/features/services/service-card";

export interface ServicesListProps {
  pageSize?: number;
}

export function ServicesList({ pageSize = 12 }: ServicesListProps) {
  const servicesQuery = usePublishedServices(pageSize);
  const services =
    servicesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (servicesQuery.isPending) {
    return (
      <LoadingState
        message="Loading services"
        description="Gathering our published architecture and design services."
      />
    );
  }

  if (servicesQuery.isError && services.length === 0) {
    return (
      <ErrorState
        title="Services could not be loaded"
        description={servicesQuery.error.message}
        onRetry={() => void servicesQuery.refetch()}
      />
    );
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon={<Layers3Icon />}
        title="Services are being prepared"
        description="There are no published services to show right now. Please check back soon."
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {servicesQuery.isError && (
        <ErrorState
          className="min-h-36"
          title="The next services could not be loaded"
          description={servicesQuery.error.message}
          retryLabel="Try loading more again"
          onRetry={() => void servicesQuery.fetchNextPage()}
        />
      )}

      {servicesQuery.hasNextPage && !servicesQuery.isError && (
        <div className="flex flex-col items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={servicesQuery.isFetchingNextPage}
            onClick={() => void servicesQuery.fetchNextPage()}
          >
            {servicesQuery.isFetchingNextPage
              ? "Loading more services…"
              : "Load more services"}
          </Button>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {services.length} services
          </p>
        </div>
      )}
    </div>
  );
}
