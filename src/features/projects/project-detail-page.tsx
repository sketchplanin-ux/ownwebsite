"use client";

import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { ProjectDetail } from "@/features/projects/project-detail";
import { usePublishedProjectBySlug } from "@/features/projects/hooks";
import { normalizePublicProjectSlug } from "@/features/projects/repository";
import { PUBLIC_ROUTES } from "@/lib/constants";

export function ProjectDetailPage() {
  const searchParams = useSearchParams();
  const slug = normalizePublicProjectSlug(searchParams.get("slug"));
  const projectQuery = usePublishedProjectBySlug(slug);

  if (!slug) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:px-8 lg:py-28">
        <EmptyState
          icon={<SearchXIcon />}
          title="Choose a project"
          description="This link does not include a valid project. Browse the published portfolio to continue."
          action={
            <Button asChild>
              <Link href={PUBLIC_ROUTES.projects}>Browse projects</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (projectQuery.isPending) {
    return (
      <LoadingState
        variant="page"
        message="Loading project"
        description="Retrieving the selected published project."
      />
    );
  }

  if (projectQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:px-8 lg:py-28">
        <ErrorState
          title="This project could not be loaded"
          description={projectQuery.error.message}
          onRetry={() => void projectQuery.refetch()}
          action={
            <Button asChild variant="ghost">
              <Link href={PUBLIC_ROUTES.projects}>Back to projects</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!projectQuery.data) {
    return (
      <div className="mx-auto w-full max-w-4xl px-6 py-20 sm:px-8 lg:py-28">
        <EmptyState
          icon={<SearchXIcon />}
          title="Project not found"
          description="The project may be unavailable or no longer published."
          action={
            <Button asChild>
              <Link href={PUBLIC_ROUTES.projects}>Browse projects</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <ProjectDetail project={projectQuery.data} />;
}
